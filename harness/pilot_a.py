"""LOL-A v0.3 PILOT - 50 sourced items through the real generation+judging chain.

Quarantine contract (why this file exists instead of touching run.py/judge.py):
  - items:    data/lol_a_pilot.jsonl          (deterministic sample, see build_sample)
  - outputs:  outputs/pilot/<model>/lol_a.jsonl   (NOT outputs/<model>/... )
  - judgments: judgments/lol_a_pilot.jsonl    (NOT judgments/lol_a_judgments.jsonl)
  - results:  results/lol_a_pilot.json        (NOT site/results.json)
Live score.py never reads pilot paths: lol_a_scores() reads only
judgments/lol_a_judgments.jsonl, and build_matchups() globs only
outputs/*/lol_b.jsonl (pilot writes lol_a.jsonl only). Running this script
cannot move the public leaderboard by construction.

Protocol: uniform argument-validity grading (judge_f6.md) for all 50 items,
family-disjoint judges, 0-100 stored /100 - the v0.3 redesign direction.
Tier labels ride in the item `family` field as T1/T2/T3 so per-tier spread
(the pilot's actual question) falls out of the same aggregation.

Usage:
  python harness/pilot_a.py                              # full pilot (50 items, all models)
  python harness/pilot_a.py --models glm-5.3-flash --max-items 2   # smoke test (~$0)
  python harness/pilot_a.py --build-only                  # just (re)write the items file + print it
"""
import argparse
import json
import random
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

from run import (
    ROOT, CFG, chat, load_env, append_result, render, load_jsonl,
    spend_exceeded, PRINT_LOCK, done_keys,
)
from judge import extract_json, judgment_done_keys, valid_counts
from score import mean, bootstrap_ci, judge_family_map, same_family, judge_validity, load_valid_judgments

PILOT_SEED = 20260906
PILOT_ITEMS = ROOT / "data" / "lol_a_pilot.jsonl"
PILOT_OUTDIR = "outputs/pilot"
PILOT_JUDGMENTS = ROOT / "judgments" / "lol_a_pilot.jsonl"
PILOT_RESULTS = ROOT / "results" / "lol_a_pilot.json"
# Same neutral framing as the F6 items: works for real jokes (model argues
# "lands" + mechanism) and would work for failed ones. Uniform protocol.
QUESTION = "Does this land as a joke, or does it fail? State your verdict, then defend it with specifics from the text."

# all 15 tier-3 (the scarce, highest-value tier) + 25 tier-1 + 10 tier-2
TIER_QUOTAS = {3: 15, 1: 25, 2: 10}


def build_sample():
    rows = [r for r in load_jsonl(ROOT / "data" / "lol_a_f1f5_candidates_draft.jsonl")]
    by_tier = {1: [], 2: [], 3: []}
    for r in rows:
        by_tier.get(r.get("draft_tier"), 2).append(r)
    rng = random.Random(PILOT_SEED)
    sample = []
    for tier in (3, 1, 2):  # scarce tier first so its quota can't be starved
        pool = by_tier[tier][:]
        rng.shuffle(pool)
        take = min(TIER_QUOTAS[tier], len(pool))
        if take < TIER_QUOTAS[tier]:
            print(f"[pilot] WARNING: tier {tier} has {len(pool)} items, wanted {TIER_QUOTAS[tier]}", flush=True)
        sample.extend(pool[:take])
    items = []
    for i, r in enumerate(sample):
        t = r["draft_tier"]
        items.append({
            "id": f"P-T{t}-{i:03d}",
            "draft_id": r["id"],
            "family": f"T{t}",
            "track": "A",
            "text": r["text"],
            "question": QUESTION,
            "gold_elements": [],
            "tier": t,
            "source": r.get("source", ""),
        })
    PILOT_ITEMS.write_text("\n".join(json.dumps(o, ensure_ascii=False) for o in items) + "\n", encoding="utf-8")
    counts = {}
    for o in items:
        counts[o["family"]] = counts.get(o["family"], 0) + 1
    print(f"[pilot] wrote {PILOT_ITEMS} ({len(items)} items: {counts})", flush=True)
    return items


def gen_model(cand, items):
    name, provider, model = cand["name"], cand["provider"], cand["model"]
    n = CFG["anchor_samples"] if cand.get("anchor") else CFG["n_samples"]
    temp = CFG["temperature"]
    mt = CFG["max_output_tokens"]
    workers = max(1, int(CFG.get("parallel_workers", 1)))
    lock = threading.Lock()
    extra = {"reasoning": {"enabled": False}} if (cand.get("think") is False and provider == "openrouter") else None
    out_a = ROOT / PILOT_OUTDIR / name / "lol_a.jsonl"
    done = done_keys(out_a)
    tasks = [(it, s) for it in items for s in range(n) if f'{it["id"]}|{s}' not in done]
    print(f"[pilot:a] {name}: {len(tasks)} calls to make", flush=True)
    cache = {it["id"]: render(ROOT / "harness" / "prompts" / "explain.md",
                              {"text": it["text"], "question": it["question"]}) for it in items}

    def worker(task):
        item, s = task
        key = f'{item["id"]}|{s}'
        if spend_exceeded():
            with PRINT_LOCK:
                print(f"[pilot:spend-guard] skipping {name} {key}", flush=True)
            return
        content = None
        budget = mt
        for _ in range(2):
            try:
                content = chat(provider, model, cand.get("base_url"),
                               [{"role": "user", "content": cache[item["id"]]}],
                               temp, budget, cost_key=name, extra_payload=extra)
            except Exception as e:
                with PRINT_LOCK:
                    print(f"[pilot:warn] {name} {key}: {e}", flush=True)
                return
            if content and content.strip():
                break
            budget = budget * 2
        append_result(out_a, {"item_id": item["id"], "sample": s, "output": content or "",
                              "empty": not (content and content.strip()),
                              "model": name, "ts": time.time()}, lock)
        done.add(key)
        with PRINT_LOCK:
            print(f"[pilot:a] {name} {key} ok", flush=True)

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(worker, tasks))


def judge_all(items, max_items=None):
    cand_family = {c["name"]: c.get("family") for c in CFG["candidates"]}
    cands = [c["name"] for c in CFG["candidates"] if c.get("enabled")]
    judges = [j for j in CFG["judges"] if j.get("enabled", True)]
    jt = CFG.get("judge_max_tokens", 1500)
    workers = max(1, int(CFG.get("judge_workers", CFG.get("parallel_workers", 1))))
    done = judgment_done_keys(PILOT_JUDGMENTS)
    lock = threading.Lock()
    print_lock = threading.Lock()
    item_ids = {it["id"] for it in (items[:max_items] if max_items else items)}

    outputs = {}
    for name in cands:
        path = ROOT / PILOT_OUTDIR / name / "lol_a.jsonl"
        if path.exists():
            outputs[name] = [r for r in load_jsonl(path) if r["item_id"] in item_ids]

    def run_judge(j):
        jname = j["name"]
        excluded = set(j.get("exclude_models", []))
        excluded |= {n for n, f in cand_family.items() if f and f == j.get("family")}
        excluded.add(j["model"])
        counts = valid_counts(PILOT_JUDGMENTS)
        todo = []
        for name, rows in outputs.items():
            if name in excluded:
                continue
            for r in rows:
                if f"{jname}|{name}|{r['item_id']}|{r['sample']}" not in done:
                    todo.append((name, r, next((it for it in items if it["id"] == r["item_id"]), None)))
        with print_lock:
            print(f"[pilot:judge:{jname}] {len(todo)} judgments to make", flush=True)

        def ask(judge_cfg, model, row, item):
            prompt = render(ROOT / "harness" / "prompts" / "judge_f6.md",
                            {"text": item["text"], "question": item["question"], "gold_elements": ""})
            messages = [{"role": "user",
                         "content": prompt + "\n\nExplanation to grade:\n" + str(row["output"])}]
            got = None
            budget = jt
            for attempt in range(5):
                try:
                    raw = chat(judge_cfg["provider"], judge_cfg["model"], judge_cfg.get("base_url"),
                               messages, 0.0, budget)
                    got = extract_json(raw)
                    if got:
                        break
                except Exception as e:
                    with print_lock:
                        print(f"[pilot:warn] {judge_cfg['name']} {model} {row['item_id']}|{row['sample']} try{attempt}: {e}", flush=True)
                    time.sleep(2 * (attempt + 1))
                budget = int(budget * 1.6)
            return got

        def worker(task):
            model, row, item = task
            if item is None:
                return
            got = ask(j, model, row, item)
            used = j
            if got is None:
                fallbacks = [oj for oj in CFG["judges"]
                             if oj.get("enabled", True) and oj["name"] != jname and model not in
                             (set(oj.get("exclude_models", [])) | {n for n, f in cand_family.items() if f and f == oj.get("family")} | {oj["model"]})]
                for fb in fallbacks:
                    got = ask(fb, model, row, item)
                    if got is not None:
                        used = fb
                        break
            if got is None:
                got = {"score": None, "reason": "judge failed to emit parseable JSON"}
                time.sleep(5)
            append_result(PILOT_JUDGMENTS,
                          {"judge": jname, "judge_model": used["model"],
                           "fallback_used": used is not j, "model": model,
                           "item_id": row["item_id"], "sample": row["sample"],
                           "score": got.get("score"), "reason": got.get("reason"),
                           "ts": time.time()}, lock)
            with print_lock:
                print(f"[pilot:judge:{jname}] {model} {row['item_id']}|{row['sample']} -> {got.get('score')}", flush=True)

        with ThreadPoolExecutor(max_workers=workers) as ex:
            list(ex.map(worker, todo))
        with print_lock:
            print(f"[pilot:judge:{jname}] complete", flush=True)

    with ThreadPoolExecutor(max_workers=len(judges)) as jex:
        list(jex.map(run_judge, judges))
    print("[pilot] judge complete", flush=True)


def score_pilot(items):
    fam_of = {it["id"]: it["family"] for it in items}
    judge_fam, cand_fam = judge_family_map()
    if not PILOT_JUDGMENTS.exists():
        print("[pilot] no judgments yet - generation produced nothing to judge (see warnings above)", flush=True)
        return
    enabled = {c["name"] for c in CFG["candidates"] if c.get("enabled")}
    per_model, per_tier = {}, {}
    for o in load_valid_judgments(PILOT_JUDGMENTS):
        if o.get("model") not in enabled:
            continue
        if o.get("model") == o.get("judge_model"):
            continue
        if same_family(o, judge_fam, cand_fam):
            continue
        if o["item_id"] not in fam_of:
            continue  # not a pilot row (paranoia; pilot file is separate anyway)
        s = float(o["score"])
        per_model.setdefault(o["model"], []).append(s)
        per_tier.setdefault((o["model"], fam_of[o["item_id"]]), []).append(s)
    out = {}
    for model, scores in sorted(per_model.items()):
        tiers = {f: {"mean": round(mean(xs), 4), "n": len(xs)}
                 for (m, f), xs in sorted(per_tier.items()) if m == model}
        out[model] = {"mean": round(mean(scores), 4), "ci95": bootstrap_ci(scores),
                      "n_scored": len(scores), "tiers": tiers}
    jv = judge_validity(PILOT_JUDGMENTS)
    PILOT_RESULTS.parent.mkdir(parents=True, exist_ok=True)
    PILOT_RESULTS.write_text(json.dumps({
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dataset": "lol_a_pilot v0.3 tier sample (seed 20260906)",
        "items": [{"id": it["id"], "tier": it["family"], "draft_id": it["draft_id"]} for it in items],
        "lol_a": out, "judge_validity": jv,
    }, indent=2), encoding="utf-8")
    print(f"\n=== PILOT RESULTS ({len(out)} models) ===")
    print(f"{'model':20s} {'overall':>8s} {'T1':>8s} {'T2':>8s} {'T3':>8s} {'n':>5s}")
    for m, s in sorted(out.items(), key=lambda kv: -kv[1]["mean"]):
        t = s["tiers"]
        cell = lambda f: f"{t[f]['mean']*100:6.1f}" if f in t else "     n/a"
        print(f"{m:20s} {s['mean']*100:7.1f} {cell('T1')} {cell('T2')} {cell('T3')} {s['n_scored']:5d}")
    print(f"judge_validity: {jv}")
    print(f"wrote {PILOT_RESULTS} (NOT site/results.json - leaderboard untouched)")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--build-only", action="store_true")
    p.add_argument("--models", default=None, help="comma list, e.g. glm-5.3-flash (smoke tests)")
    p.add_argument("--max-items", type=int, default=None, help="cap pilot items (smoke tests)")
    args = p.parse_args()
    load_env()
    items = build_sample()
    if args.build_only:
        return
    if args.max_items:
        items = items[:args.max_items]
    cands = [c for c in CFG["candidates"] if c.get("enabled")]
    if args.models:
        want = set(args.models.split(","))
        cands = [c for c in cands if c["name"] in want]
        if not cands:
            print(f"no enabled candidates match {args.models}")
            return
    for cand in cands:
        print(f"=== {cand['name']} ===", flush=True)
        gen_model(cand, items)
    judge_all(items, max_items=args.max_items)
    score_pilot(items)
    print("[pilot] complete")


if __name__ == "__main__":
    main()

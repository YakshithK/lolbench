"""Familiarity kill-test runner - fork of pilot_a.py, same quarantine contract.

Question under test (docs/10-familiarity-kill-test.md): does the T-tier vs F6
gap (famous-working ~92-95 vs obscure-failed ~81) survive on obscure WORKING
jokes? If it collapses, the axis is familiarity (retrieval), not
success/failure reasoning. Pre-registered predictions P1/P2/P3 in docs/10.

Quarantine contract (identical shape to the pilot - running this can never
move the public leaderboard, by construction):
  - items:     data/lol_a_items_familiarity.jsonl
  - outputs:   outputs/pilot_familiarity/<model>/lol_a.jsonl
  - judgments: judgments/lol_a_judgments_familiarity.jsonl
  - results:   results/lol_a_familiarity.json
score.py reads only judgments/lol_a_judgments.jsonl; build_matchups() globs
only outputs/*/lol_b.jsonl. This script writes to none of those paths.

Protocol: identical to the main run's T-tier treatment - explain.md prompt,
judge_f6.md argument-validity rubric, family-disjoint judges, 0-100 stored
/100, n=3 samples (anchors n=1). The comparison anchors (famous-working T1,
obscure-failed F6) are pulled READ-ONLY from site/results.json at scoring
time; if the main-run file is missing they print as n/a.

Items come from data/killtest_finalists.jsonl (candidates that survived
web-obscurity verification + owner taste read), NOT the raw candidate file.

Usage:
  python harness/killtest_a.py --build-only
  python harness/killtest_a.py --models qwen3.8-flash --max-items 2   # ~$0 smoke
  python harness/killtest_a.py                                        # full run
"""
import argparse
import json
import random
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

from run import (
    ROOT, CFG, chat, load_env, append_result, render, load_jsonl,
    spend_exceeded, PRINT_LOCK, done_keys,
)
from judge import extract_json, judgment_done_keys, valid_counts
from score import mean, bootstrap_ci, judge_family_map, same_family, judge_validity, load_valid_judgments

KT_SEED = 20260912
KT_ITEMS = ROOT / "data" / "lol_a_items_familiarity.jsonl"
KT_OUTDIR = "outputs/pilot_familiarity"
KT_JUDGMENTS = ROOT / "judgments" / "lol_a_judgments_familiarity.jsonl"
KT_RESULTS = ROOT / "results" / "lol_a_familiarity.json"
FINALISTS = ROOT / "data" / "killtest_finalists.jsonl"
SITE_RESULTS = ROOT / "site" / "results.json"
# Same neutral framing as the pilot/F6 items - uniform protocol is the point.
QUESTION = "Does this land as a joke, or does it fail? State your verdict, then defend it with specifics from the text."


def build_items():
    rows = load_jsonl(FINALISTS)
    if not rows:
        print(f"[killtest] {FINALISTS} empty/missing - run web verification + owner taste read first", flush=True)
        return []
    items = []
    for i, r in enumerate(rows):
        arm = "K2" if r["id"].startswith("R-") else "K1"
        items.append({
            "id": f"KT-{i:03d}",
            "draft_id": r["id"],
            "family": arm,           # K1 = obscure-working (verified), K2 = post-cutoff-working
            "track": "A",
            "text": r["text"],
            "question": QUESTION,
            "gold_elements": [],
            "tier": r.get("draft_tier"),   # stratification vs the T-tier anchors
            "source": r.get("source", ""),
            "obscurity_evidence": r.get("obscurity_evidence", {}),
        })
    KT_ITEMS.write_text("\n".join(json.dumps(o, ensure_ascii=False) for o in items) + "\n", encoding="utf-8")
    counts = {}
    for o in items:
        counts[o["family"]] = counts.get(o["family"], 0) + 1
    print(f"[killtest] wrote {KT_ITEMS} ({len(items)} items: {counts})", flush=True)
    return items


def gen_model(cand, items):
    name, provider, model = cand["name"], cand["provider"], cand["model"]
    n = CFG["anchor_samples"] if cand.get("anchor") else CFG["n_samples"]
    temp = CFG["temperature"]
    mt = CFG["max_output_tokens"]
    workers = max(1, int(CFG.get("parallel_workers", 1)))
    lock = threading.Lock()
    extra = {"reasoning": {"enabled": False}} if (cand.get("think") is False and provider == "openrouter") else None
    out_a = ROOT / KT_OUTDIR / name / "lol_a.jsonl"
    done = done_keys(out_a)
    tasks = [(it, s) for it in items for s in range(n) if f'{it["id"]}|{s}' not in done]
    print(f"[killtest:a] {name}: {len(tasks)} calls to make", flush=True)
    cache = {it["id"]: render(ROOT / "harness" / "prompts" / "explain.md",
                              {"text": it["text"], "question": it["question"]}) for it in items}

    def worker(task):
        item, s = task
        key = f'{item["id"]}|{s}'
        if spend_exceeded():
            with PRINT_LOCK:
                print(f"[killtest:spend-guard] skipping {name} {key}", flush=True)
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
                    print(f"[killtest:warn] {name} {key}: {e}", flush=True)
                return
            if content and content.strip():
                break
            budget = budget * 2
        append_result(out_a, {"item_id": item["id"], "sample": s, "output": content or "",
                              "empty": not (content and content.strip()),
                              "model": name, "ts": time.time()}, lock)
        done.add(key)
        with PRINT_LOCK:
            print(f"[killtest:a] {name} {key} ok", flush=True)

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(worker, tasks))


def judge_all(items, max_items=None):
    cand_family = {c["name"]: c.get("family") for c in CFG["candidates"]}
    cands = [c["name"] for c in CFG["candidates"] if c.get("enabled")]
    judges = [j for j in CFG["judges"] if j.get("enabled", True)]
    jt = CFG.get("judge_max_tokens", 1500)
    workers = max(1, int(CFG.get("judge_workers", CFG.get("parallel_workers", 1))))
    done = judgment_done_keys(KT_JUDGMENTS)
    lock = threading.Lock()
    print_lock = threading.Lock()
    item_ids = {it["id"] for it in (items[:max_items] if max_items else items)}

    outputs = {}
    for name in cands:
        path = ROOT / KT_OUTDIR / name / "lol_a.jsonl"
        if path.exists():
            outputs[name] = [r for r in load_jsonl(path) if r["item_id"] in item_ids]

    def run_judge(j):
        jname = j["name"]
        excluded = set(j.get("exclude_models", []))
        excluded |= {n for n, f in cand_family.items() if f and f == j.get("family")}
        excluded.add(j["model"])
        counts = valid_counts(KT_JUDGMENTS)
        todo = []
        for name, rows in outputs.items():
            if name in excluded:
                continue
            for r in rows:
                if f"{jname}|{name}|{r['item_id']}|{r['sample']}" not in done:
                    todo.append((name, r, next((it for it in items if it["id"] == r["item_id"]), None)))
        with print_lock:
            print(f"[killtest:judge:{jname}] {len(todo)} judgments to make", flush=True)

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
                        print(f"[killtest:warn] {judge_cfg['name']} {model} {row['item_id']}|{row['sample']} try{attempt}: {e}", flush=True)
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
            append_result(KT_JUDGMENTS,
                          {"judge": jname, "judge_model": used["model"],
                           "fallback_used": used is not j, "model": model,
                           "item_id": row["item_id"], "sample": row["sample"],
                           "score": got.get("score"), "reason": got.get("reason"),
                           "ts": time.time()}, lock)
            with print_lock:
                print(f"[killtest:judge:{jname}] {model} {row['item_id']}|{row['sample']} -> {got.get('score')}", flush=True)

        with ThreadPoolExecutor(max_workers=workers) as ex:
            list(ex.map(worker, todo))
        with print_lock:
            print(f"[killtest:judge:{jname}] complete", flush=True)

    with ThreadPoolExecutor(max_workers=len(judges)) as jex:
        list(jex.map(run_judge, judges))
    print("[killtest] judge complete", flush=True)


def main_run_anchors():
    """Read-only pull of the comparison anchors from the published board."""
    try:
        r = json.loads(SITE_RESULTS.read_text(encoding="utf-8-sig"))
        return r.get("lol_a", {})
    except Exception:
        return {}


def score_killtest(items):
    fam_of = {it["id"]: it["family"] for it in items}
    tier_of = {it["id"]: it.get("tier") for it in items}
    judge_fam, cand_fam = judge_family_map()
    if not KT_JUDGMENTS.exists():
        print("[killtest] no judgments yet - nothing to score", flush=True)
        return
    enabled = {c["name"] for c in CFG["candidates"] if c.get("enabled")}
    per_model, per_arm, per_armtier = {}, {}, {}
    for o in load_valid_judgments(KT_JUDGMENTS):
        if o.get("model") not in enabled or o.get("model") == o.get("judge_model"):
            continue
        if same_family(o, judge_fam, cand_fam) or o["item_id"] not in fam_of:
            continue
        s = float(o["score"])
        m, arm = o["model"], fam_of[o["item_id"]]
        per_model.setdefault(m, []).append(s)
        per_arm.setdefault((m, arm), []).append(s)
        if arm == "K1":
            per_armtier.setdefault((m, tier_of[o["item_id"]]), []).append(s)
    anchors = main_run_anchors()
    out = {}
    for model, scores in sorted(per_model.items()):
        a = anchors.get(model, {})
        fams = a.get("families", {})
        out[model] = {
            "mean": round(mean(scores), 4), "ci95": bootstrap_ci(scores), "n_scored": len(scores),
            "arms": {f: {"mean": round(mean(xs), 4), "n": len(xs)}
                     for (m, f), xs in sorted(per_arm.items()) if m == model},
            "k1_tiers": {f"K1-T{k}": {"mean": round(mean(xs), 4), "n": len(xs)}
                         for (m, k), xs in sorted(per_armtier.items()) if m == model},
            # read-only anchors from the published board (the 2x2's other cells)
            "anchor_T1_famous_working": fams.get("T1", {}).get("mean"),
            "anchor_T2_famous_working": fams.get("T2", {}).get("mean"),
            "anchor_F6_obscure_failed": fams.get("F6", {}).get("mean"),
        }
    jv = judge_validity(KT_JUDGMENTS)
    KT_RESULTS.parent.mkdir(parents=True, exist_ok=True)
    KT_RESULTS.write_text(json.dumps({
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dataset": "lol_a familiarity kill-test (docs/10, seed 20260912)",
        "items": [{"id": it["id"], "arm": it["family"], "tier": it.get("tier"), "draft_id": it["draft_id"]} for it in items],
        "lol_a": out, "judge_validity": jv,
    }, indent=2), encoding="utf-8")
    print(f"\n=== KILL-TEST RESULTS ({len(out)} models) - the 2x2 per model ===")
    print(f"{'model':20s} {'famous~work':>11s} {'obsc~work':>10s} {'obsc~fail':>10s} {'gap_T-K':>8s} {'gap_K-F6':>9s} {'n':>5s}")
    for m, s in sorted(out.items(), key=lambda kv: -kv[1]["mean"]):
        t1 = s.get("anchor_T1_famous_working")
        k1 = s["arms"].get("K1", {}).get("mean")
        f6 = s.get("anchor_F6_obscure_failed")
        g1 = f"{(t1 - k1) * 100:7.1f}" if (t1 is not None and k1 is not None) else "     n/a"
        g2 = f"{(k1 - f6) * 100:8.1f}" if (k1 is not None and f6 is not None) else "      n/a"
        fmt = lambda v: f"{v * 10:10.1f}" if v is not None else f"{'n/a':>10s}"
        print(f"{m:20s} {fmt(t1)} {fmt(k1)} {fmt(f6)} {g1} {g2} {s['n_scored']:5d}")
    print("\nReading: gap_T-K ~ 0 => P1 (reasoning; F6 uncontaminated).")
    print("         gap_K-F6 ~ 0 => P2 (familiarity; the T-tier number was partly retrieval).")
    print("         both > 0    => P3 (decompose: familiarity share + reasoning share).")
    print(f"judge_validity: {jv}")
    print(f"wrote {KT_RESULTS} (NOT site/results.json - leaderboard untouched)")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--build-only", action="store_true")
    p.add_argument("--models", default=None, help="comma list (smoke tests)")
    p.add_argument("--max-items", type=int, default=None, help="cap items (smoke tests)")
    args = p.parse_args()
    load_env()
    items = build_items()
    if args.build_only or not items:
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
    score_killtest(items)
    print("[killtest] complete")


if __name__ == "__main__":
    main()

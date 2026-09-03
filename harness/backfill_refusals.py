"""One-off backfill: re-judge the (judge, model, item, sample) rows that were
hallucinated refusals, now that is_refusal() catches every phrasing found
(106 confirmed false claims, up from an earlier narrower regex that only
caught 69). judge.py's own "done" tracking can't distinguish an old bad row
from a real one (it only checks score-is-not-None), so those rows would
never get re-attempted by a normal run - this targets them explicitly, and
falls back to the other configured judge if the primary fails 5 retries
again (some rows fail the same way every time regardless of retries -
confirmed empirically, not a random per-call rate). Delete this file once
it's been run; it's not part of the normal pipeline."""
import json
import time

from run import ROOT, CFG, chat, load_jsonl, load_env, append_result, render
from judge import extract_json, is_refusal


def load(path):
    with open(path, encoding="utf-8-sig") as f:
        return [json.loads(l) for l in f if l.strip()]


def ask_judge(judge_cfg, item, row, jt):
    prompt = render(
        ROOT / "harness" / "prompts" / "judge.md",
        {"text": item["text"], "question": item["question"], "gold_elements": "; ".join(item["gold_elements"])},
    )
    messages = [{"role": "user", "content": prompt + "\n\nExplanation to grade:\n" + str(row["output"])}]
    got = None
    budget = jt
    for attempt in range(5):
        try:
            raw = chat(judge_cfg["provider"], judge_cfg["model"], judge_cfg.get("base_url"), messages, 0.0, budget)
            got = extract_json(raw)
            if got:
                break
        except Exception as e:
            print(f"  warn {judge_cfg['name']} try{attempt}: {e}")
            time.sleep(2 * (attempt + 1))
        budget = int(budget * 1.6)
    return got


def main():
    load_env()
    items = {i["id"]: i for i in load_jsonl(ROOT / CFG["paths"]["items_a"])}
    judges = {j["name"]: j for j in CFG["judges"]}
    cand_fam = {c["name"]: c.get("family") for c in CFG["candidates"]}
    enabled = {c["name"] for c in CFG["candidates"] if c.get("enabled")}
    out_path = ROOT / CFG["paths"]["judgments"] / "lol_a_judgments.jsonl"
    jt = CFG.get("judge_max_tokens", 1500)

    raw = load(out_path)
    best = {}
    for o in raw:
        if o.get("score") is None:
            continue
        best[(o["judge"], o["model"], o["item_id"], o["sample"])] = o
    bad = [k for k, o in best.items() if is_refusal(o.get("reason")) and k[1] in enabled]
    print(f"re-judging {len(bad)} rows")

    outputs_cache = {}

    def get_row(model, item_id, sample):
        if model not in outputs_cache:
            outputs_cache[model] = {(r["item_id"], r["sample"]): r for r in load(ROOT / CFG["paths"]["outputs"] / model / "lol_a.jsonl")}
        return outputs_cache[model].get((item_id, sample))

    for jname, model, item_id, sample in bad:
        j = judges[jname]
        item = items.get(item_id)
        row = get_row(model, item_id, sample)
        if item is None or row is None:
            print(f"skip {jname}|{model}|{item_id}|{sample}: missing item or output")
            continue

        got = ask_judge(j, item, row, jt)
        used_judge = j
        if got is None:
            fallback = next(
                (oj for oj in CFG["judges"] if oj["name"] != jname and model not in
                 (set(oj.get("exclude_models", [])) | {n for n, f in cand_fam.items() if f and f == oj.get("family")} | {oj["model"]})),
                None,
            )
            if fallback:
                print(f"  {jname}|{model}|{item_id}|{sample}: primary failed 5x, trying {fallback['name']}")
                got = ask_judge(fallback, item, row, jt)
                if got is not None:
                    used_judge = fallback
        if got is None:
            got = {"score": None, "reason": "judge failed to emit parseable JSON on backfill"}

        append_result(out_path, {
            "judge": jname, "judge_model": used_judge["model"], "fallback_used": used_judge is not j,
            "model": model, "item_id": item_id, "sample": sample,
            "score": got.get("score"), "reason": got.get("reason"), "ts": time.time(),
        })
        print(f"  {jname}|{model}|{item_id}|{sample} -> {got.get('score')} (via {used_judge['name']})")

    print("backfill complete")


if __name__ == "__main__":
    main()

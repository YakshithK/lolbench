import argparse
import json
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor

import yaml

from run import ROOT, CFG, chat, load_jsonl, load_env, append_result, render


def extract_json(text):
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        return None
    try:
        o = json.loads(m.group(0))
        if "score" in o and o["score"] in (0, 0.5, 1, "0", "0.5", "1"):
            return o
    except Exception:
        return None
    return None


def judgment_done_keys(path):
    """A judgment is 'done' only when it produced a valid score.
    Null rows (judge quota failures / unparseable output) must retry on the
    next run, otherwise a single quota storm permanently blanks the board."""
    keys = set()
    if path.exists():
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            if line.strip():
                try:
                    o = json.loads(line)
                    if o.get("score") is not None:
                        keys.add(f'{o["judge"]}|{o["model"]}|{o["item_id"]}|{o["sample"]}')
                except Exception:
                    pass
    return keys


def valid_counts(path):
    """Valid-judgment count per (judge, model) so under-judged models go first."""
    counts = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            if line.strip():
                try:
                    o = json.loads(line)
                    if o.get("score") is not None:
                        k = (o["judge"], o["model"])
                        counts[k] = counts.get(k, 0) + 1
                except Exception:
                    pass
    return counts


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None, help="cap judgments per judge (smoke tests)")
    args = parser.parse_args()

    load_env()
    items = {i["id"]: i for i in load_jsonl(ROOT / CFG["paths"]["items_a"])}
    cand_family = {c["name"]: c.get("family") for c in CFG["candidates"]}
    cands = [c["name"] for c in CFG["candidates"] if c.get("enabled")]
    judges = CFG["judges"]
    jt = CFG.get("judge_max_tokens", 1500)
    workers = max(1, int(CFG.get("judge_workers", CFG.get("parallel_workers", 1))))
    out = ROOT / CFG["paths"]["judgments"] / "lol_a_judgments.jsonl"
    done = judgment_done_keys(out)
    lock = threading.Lock()
    print_lock = threading.Lock()

    outputs = {}
    for name in cands:
        path = ROOT / CFG["paths"]["outputs"] / name / "lol_a.jsonl"
        if path.exists():
            rows = load_jsonl(path)
            if args.limit:
                rows = rows[: args.limit]
            outputs[name] = rows

    def run_judge(j):
        jname = j["name"]
        # A judge never grades its own family: exact model name, or any
        # sibling candidate that shares the judge's `family` tag.
        excluded = set(j.get("exclude_models", []))
        excluded |= {name for name, fam in cand_family.items() if fam and fam == j.get("family")}
        excluded.add(j["model"])
        counts = valid_counts(out)
        # Under-judged models first: backfill before touching well-scored rows.
        todo = []
        for name, rows in outputs.items():
            if name in excluded:
                continue
            model_rows = [r for r in rows if f"{jname}|{name}|{r['item_id']}|{r['sample']}" not in done]
            model_rows.sort(key=lambda r: counts.get((jname, name), 0))
            todo.extend((name, r, items.get(r["item_id"])) for r in model_rows)
        # Item-major order inside the sort group keeps checkpoint progress coherent.
        todo.sort(key=lambda t: (counts.get((jname, t[0]), 0), t[1]["item_id"], t[1]["sample"]))
        with print_lock:
            print(f"[judge:{jname}] {len(todo)} judgments to make", flush=True)

        def judge_worker(task):
            model, row, item = task
            if item is None:
                return
            prompt = render(
                ROOT / "harness" / "prompts" / "judge.md",
                {
                    "text": item["text"],
                    "question": item["question"],
                    "gold_elements": "; ".join(item["gold_elements"]),
                },
            )
            messages = [{
                "role": "user",
                "content": prompt + "\n\nExplanation to grade:\n" + str(row["output"]),
            }]
            got = None
            # B.AI reasoning models spend max_tokens on hidden reasoning; when the
            # budget starves, content comes back empty or truncated. Escalate.
            budget = jt
            for attempt in range(5):
                try:
                    raw = chat(j["provider"], j["model"], j.get("base_url"), messages, 0.0, budget)
                    got = extract_json(raw)
                    if got:
                        break
                except Exception as e:
                    with print_lock:
                        print(f"[warn] {jname} {model} {row['item_id']}|{row['sample']} try{attempt}: {e}", flush=True)
                    time.sleep(2 * (attempt + 1))
                budget = int(budget * 1.6)
            if got is None:
                got = {"score": None, "reason": "judge failed to emit parseable JSON"}
                time.sleep(5)
            append_result(
                out,
                {
                    "judge": jname,
                    "judge_model": j["model"],
                    "model": model,
                    "item_id": row["item_id"],
                    "sample": row["sample"],
                    "score": got.get("score"),
                    "reason": got.get("reason"),
                    "ts": time.time(),
                },
                lock,
            )
            with print_lock:
                print(f"[judge:{jname}] {model} {row['item_id']}|{row['sample']} -> {got.get('score')}", flush=True)

        with ThreadPoolExecutor(max_workers=workers) as ex:
            list(ex.map(judge_worker, todo))
        with print_lock:
            print(f"[judge:{jname}] complete", flush=True)

    with ThreadPoolExecutor(max_workers=len(judges)) as jex:
        list(jex.map(run_judge, judges))

    print("judge complete")


if __name__ == "__main__":
    main()

import json
import os
import re
import time
from pathlib import Path

import yaml

from run import ROOT, CFG, chat, load_jsonl, load_env, append_result, done_keys, render

JUDGE_MARKER = '{"score":'


def parse_items():
    items = {i["id"]: i for i in load_jsonl(ROOT / CFG["paths"]["items_a"])}
    return items


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


def main():
    load_env()
    items = parse_items()
    j = CFG["judge"]
    provider, model, base_url = j["provider"], j["model"], j.get("base_url")
    out = ROOT / CFG["paths"]["judgments"] / "lol_a_judgments.jsonl"
    done = done_keys(out)
    n = CFG["n_samples"]

    cands = {c["name"]: c for c in CFG["candidates"] if c.get("enabled")}

    todo = 0
    work = []
    for name, ofile in cands.items():
        path = ROOT / CFG["paths"]["outputs"] / name / "lol_a.jsonl"
        if not path.exists():
            continue
        for row in load_jsonl(path):
            key = f'{row["item_id"]}|{row["sample"]}'
            if key in done:
                continue
            work.append((name, row, items.get(row["item_id"])))
            todo += 1
    print(f"[judge] {todo} judgments to make", flush=True)

    for name, row, item in work:
        if item is None:
            continue
        prompt = render(
            ROOT / "harness" / "prompts" / "judge.md",
            {
                "text": item["text"],
                "question": item["question"],
                "gold_elements": "; ".join(item["gold_elements"]),
            },
        )
        messages = [
            {"role": "user", "content": prompt},
            {"role": "user", "content": f"Explanation to grade:\n{row['output']}"},
        ]
        got = None
        for attempt in range(3):
            try:
                raw = chat(provider, model, base_url, messages, 0.0, 200)
                got = extract_json(raw)
                if got:
                    break
            except Exception as e:
                print(f"[warn] judge {name} {row['item_id']}|{row['sample']} try{attempt}: {e}", flush=True)
        if got is None:
            got = {"score": None, "reason": "judge failed to emit parseable JSON"}
        append_result(
            out,
            {
                "model": name,
                "item_id": row["item_id"],
                "sample": row["sample"],
                "score": got.get("score"),
                "reason": got.get("reason"),
                "judge": model,
                "ts": time.time(),
            },
        )
        print(f"[judge] {name} {row['item_id']}|{row['sample']} -> {got.get('score')}", flush=True)

    print("judge complete")


if __name__ == "__main__":
    main()

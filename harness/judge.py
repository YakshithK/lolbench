import json
import re
import time

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
    keys = set()
    if path.exists():
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            if line.strip():
                try:
                    o = json.loads(line)
                    keys.add(f'{o["judge"]}|{o["model"]}|{o["item_id"]}|{o["sample"]}')
                except Exception:
                    pass
    return keys


def main():
    load_env()
    items = {i["id"]: i for i in load_jsonl(ROOT / CFG["paths"]["items_a"])}
    cands = [c["name"] for c in CFG["candidates"] if c.get("enabled")]
    judges = CFG["judges"]
    jt = CFG.get("judge_max_tokens", 1500)
    out = ROOT / CFG["paths"]["judgments"] / "lol_a_judgments.jsonl"
    done = judgment_done_keys(out)

    outputs = {}
    for name in cands:
        path = ROOT / CFG["paths"]["outputs"] / name / "lol_a.jsonl"
        if path.exists():
            outputs[name] = load_jsonl(path)

    for j in judges:
        jname = j["name"]
        excluded = set(j.get("exclude_models", []))
        todo = []
        for name, rows in outputs.items():
            if name in excluded:
                continue
            for row in rows:
                key = f"{jname}|{name}|{row['item_id']}|{row['sample']}"
                if key in done:
                    continue
                todo.append((name, row, items.get(row["item_id"])))
        print(f"[judge:{jname}] {len(todo)} judgments to make", flush=True)
        for model, row, item in todo:
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
                    raw = chat(j["provider"], j["model"], j.get("base_url"), messages, 0.0, jt)
                    got = extract_json(raw)
                    if got:
                        break
                except Exception as e:
                    print(f"[warn] {jname} {model} {row['item_id']}|{row['sample']} try{attempt}: {e}", flush=True)
            if got is None:
                got = {"score": None, "reason": "judge failed to emit parseable JSON"}
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
            )
            done.add(f"{jname}|{model}|{row['item_id']}|{row['sample']}")
        print(f"[judge:{jname}] complete", flush=True)

    print("judge complete")


if __name__ == "__main__":
    main()

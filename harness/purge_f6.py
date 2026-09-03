"""Clears old F6 outputs and judgments so run.py/judge.py treat F6 as pending
work again, instead of skipping it as already-done. Necessary because both
scripts checkpoint by (item_id, sample) existing on disk - they have no way
to know the F6 question/rubric changed underneath the same item IDs. Safe to
re-run; only touches F6 rows, F1-F5 are untouched."""
import json

import yaml

from run import ROOT, CFG

CFG_LOCAL = yaml.safe_load((ROOT / "harness" / "config.yaml").read_text(encoding="utf-8"))


def load(path):
    with open(path, encoding="utf-8-sig") as f:
        return [json.loads(l) for l in f if l.strip()]


def main():
    items = {i["id"]: i for i in load(ROOT / CFG["paths"]["items_a"])}
    f6_ids = {iid for iid, it in items.items() if it["family"] == "F6"}
    print(f"purging {len(f6_ids)} F6 item IDs from outputs and judgments")

    for c in CFG["candidates"]:
        path = ROOT / CFG["paths"]["outputs"] / c["name"] / "lol_a.jsonl"
        if not path.exists():
            continue
        rows = load(path)
        kept = [r for r in rows if r["item_id"] not in f6_ids]
        removed = len(rows) - len(kept)
        if removed:
            path.write_text("\n".join(json.dumps(r, ensure_ascii=False) for r in kept) + ("\n" if kept else ""), encoding="utf-8")
            print(f"  {c['name']}: removed {removed} F6 output rows")

    jpath = ROOT / CFG["paths"]["judgments"] / "lol_a_judgments.jsonl"
    if jpath.exists():
        rows = load(jpath)
        kept = [r for r in rows if r["item_id"] not in f6_ids]
        removed = len(rows) - len(kept)
        jpath.write_text("\n".join(json.dumps(r, ensure_ascii=False) for r in kept) + ("\n" if kept else ""), encoding="utf-8")
        print(f"judgments: removed {removed} F6 judgment rows")

    print("done - F6 is now pending work for run.py and judge.py")


if __name__ == "__main__":
    main()

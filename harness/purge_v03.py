"""Purge superseded v0.2 F1-F5 rows ahead of the v0.3 cutover.

Why deletion (not filtering in score.py): score.py aggregates every row in
the judgments file, resolving family via the CURRENT items file - old F1-F5
rows would fall back to family "unknown" yet still count toward model means,
silently mixing v0.2 fixed-answer scores into v0.3 argument-validity numbers.
Removing the rows is the same precedent as harness/purge_f6.py. The wrapper
(harness/run_v03.ps1) backs everything up first; this script never deletes
anything it cannot re-derive.

Rule: drop a row iff its item_id was in the pre-cutover items file AND its
family there was not F6. F6 rows are already judged under the new rubric and
must survive. Unknown IDs (orphans) are kept, never deleted.

Idempotent: re-running finds nothing to remove.
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "harness"))
from run import CFG, load_jsonl  # noqa: E402


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--items-backup", default=None,
                   help="pre-cutover live items file (source of the old-ID set)")
    p.add_argument("--dry-run", action="store_true",
                   help="report what would be removed without touching anything; "
                        "reads the CURRENT live items file as the old-ID set")
    args = p.parse_args()

    if args.dry_run:
        src = ROOT / CFG["paths"]["items_a"]
        print("[purge_v03] DRY RUN - nothing will be modified", flush=True)
    else:
        if not args.items_backup:
            print("[purge_v03] ERROR: --items-backup is required (refusing blind purge)", flush=True)
            sys.exit(2)
        src = Path(args.items_backup)
        if not src.exists():
            print(f"[purge_v03] ERROR: backup not found: {src}", flush=True)
            sys.exit(2)

    old = {o["id"]: o.get("family") for o in load_jsonl(src)}
    drop_ids = {i for i, f in old.items() if f != "F6"}
    print(f"[purge_v03] old-ID set: {len(old)} items "
          f"({sum(1 for f in old.values() if f == 'F6')} F6 kept, {len(drop_ids)} F1-F5 dropped)", flush=True)

    total_j, total_o = 0, 0
    jpath = ROOT / CFG["paths"]["judgments"] / "lol_a_judgments.jsonl"
    if jpath.exists():
        rows = load_jsonl(jpath)
        kept = [o for o in rows if o.get("item_id") not in drop_ids]
        dropped = len(rows) - len(kept)
        total_j = dropped
        print(f"[purge_v03] judgments: {len(rows)} -> {len(kept)} (dropped {dropped})", flush=True)
        if not args.dry_run:
            jpath.write_text("\n".join(json.dumps(o, ensure_ascii=False) for o in kept) + ("\n" if kept else ""), encoding="utf-8")
    else:
        print("[purge_v03] no judgments file - nothing to do", flush=True)

    out_dir = ROOT / CFG["paths"]["outputs"]
    for f in sorted(out_dir.glob("*/lol_a.jsonl")):
        rows = load_jsonl(f)
        kept = [o for o in rows if o.get("item_id") not in drop_ids]
        dropped = len(rows) - len(kept)
        total_o += dropped
        if dropped:
            print(f"[purge_v03] {f.parent.name}/lol_a.jsonl: {len(rows)} -> {len(kept)} (dropped {dropped})", flush=True)
        if not args.dry_run and dropped:
            f.write_text("\n".join(json.dumps(o, ensure_ascii=False) for o in kept) + ("\n" if kept else ""), encoding="utf-8")
    print(f"[purge_v03] {'WOULD drop' if args.dry_run else 'dropped'} {total_j} judgment rows + {total_o} output rows; F6 + unknown IDs untouched", flush=True)


if __name__ == "__main__":
    main()

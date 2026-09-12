"""Build the v0.3 LOL-A items file as a REVIEWABLE STAGING artifact.

Reads draft tiered candidates + the live F6 rows, writes
data/lol_a_items.v03.jsonl. Does NOT touch the live items file, judgments,
or outputs - the cutover (backup, swap, purge, version bump) happens in
harness/run_v03.ps1, which the owner runs explicitly.

Deterministic: tier order T1,T2,T3, draft-file order within tier, fixed IDs.
Rerunning overwrites the staging file with identical content.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "harness"))
from run import load_jsonl  # noqa: E402  (jsonl read with blank-line tolerance)

DRAFT = ROOT / "data" / "lol_a_f1f5_candidates_draft.jsonl"
LIVE = ROOT / "data" / "lol_a_items.jsonl"
STAGING = ROOT / "data" / "lol_a_items.v03.jsonl"

# Neutral verdict+defend framing, same as the pilot + F6 items. Uniform
# protocol across all tiers: the pilot showed argument-validity grading is
# what produces spread (T1 9.7 / T2 12.2 / T3 9.0 pts).
QUESTION = "Does this land as a joke, or does it fail? State your verdict, then defend it with specifics from the text."
CANARY = "cb1a4f2e-9d37-4c8a-b6d1-lolbench-v0.1.0"  # stable tripwire; dataset version tracked separately via dataset_version


def license_for(source):
    if "dadjokes" in source:
        return "Apache 2.0"
    return "Reddit ToS; takedown-on-request"


def main():
    rows = load_jsonl(DRAFT)
    by_tier = {1: [], 2: [], 3: []}
    for r in rows:
        by_tier.get(r.get("draft_tier"), 2).append(r)
    live = load_jsonl(LIVE)
    f6 = [r for r in live if r.get("family") == "F6"]
    assert len(f6) == 25, f"expected 25 live F6 rows, found {len(f6)} - live file changed under us?"

    out = []
    for tier in (1, 2, 3):
        for i, r in enumerate(by_tier[tier]):
            out.append({
                "id": f"A-T{tier}-{i:03d}",
                "draft_id": r["id"],
                "family": f"T{tier}",
                "track": "A",
                "text": r["text"],
                "question": QUESTION,
                "gold_elements": [],
                "edginess_budget": 0,
                "canary": CANARY,
                "provenance": {
                    "source": r.get("source", ""),
                    "license": license_for(r.get("source", "")),
                    "annotators": ["agent-draft", "pending-owner-curation"],
                },
                "status": "draft",
                "version_added": "0.3.0",
                "version_retired": None,
            })
    out.extend(f6)  # verbatim: already judged under the new rubric, never regenerated
    ids = [o["id"] for o in out]
    assert len(set(ids)) == len(ids), "duplicate item IDs in v0.3 set"
    STAGING.write_text("\n".join(json.dumps(o, ensure_ascii=False) for o in out) + "\n", encoding="utf-8")
    counts = {t: len(by_tier[t]) for t in (1, 2, 3)}
    print(f"[build_v03] wrote {STAGING}: {len(out)} rows = tiered {counts} + F6 25", flush=True)
    print("[build_v03] live files untouched - review the staging file, then run .\\harness\\run_v03.ps1", flush=True)


if __name__ == "__main__":
    main()

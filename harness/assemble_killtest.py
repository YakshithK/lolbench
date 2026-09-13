"""Assembles the kill-test taste-read package (docs/10 step 2->3).

Joins data/killtest_candidates.jsonl with the per-batch web-verification
evidence files (data/killtest_verify_batch*.jsonl), applies the verdicts, and
writes:
  - data/killtest_review.html : the owner taste-read page (read, then reply
    with the ids to kill; the page is the review surface, chat replies are
    the decision record)
  - prints the boundary-flag summary that goes to the owner

Only web-verified OBSCURE candidates reach the taste read. Flagged jokes are
excluded by the pre-registered criteria (their provenance is preserved in the
verify files). Unverified jokes are held back unless the obscure count runs
short of 50+10.

Usage: python harness/assemble_killtest.py [--final keep_ids.txt]
  --final: after the owner's kill list, promote the survivors to
           data/killtest_finalists.jsonl (the runner's input).
"""
import argparse
import html
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
CANDS = DATA / "killtest_candidates.jsonl"
VERIFY_GLOB = sorted(DATA.glob("killtest_verify_batch*.jsonl"))
REVIEW_HTML = DATA / "killtest_review.html"
FINALISTS = DATA / "killtest_finalists.jsonl"
KEEP_TARGET_K1 = 60  # 50 items + 10 spares, pre-taste-read
TARGET_K23 = 40      # K2/K3 combined target after verification


def load_verify():
    v = {}
    for p in VERIFY_GLOB:
        for line in p.read_text(encoding="utf-8-sig").splitlines():
            if not line.strip():
                continue
            try:
                r = json.loads(line)
            except Exception:
                continue
            v[r["id"]] = r
    return v


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--final", default=None, help="file with candidate ids to KEEP, one per line (owner decision applied)")
    args = ap.parse_args()

    cands = [json.loads(l) for l in CANDS.read_text(encoding="utf-8-sig").splitlines() if l.strip()]
    verdicts = load_verify()
    missing = [c["id"] for c in cands if c["id"] not in verdicts]

    if args.final:
        keeps = {l.strip() for l in Path(args.final).read_text(encoding="utf-8-sig").splitlines() if l.strip()}
        out = []
        for c in cands:
            if c["id"] in keeps and verdicts.get(c["id"], {}).get("verdict") == "obscure":
                c["obscurity_evidence"] = verdicts[c["id"]]
                out.append(c)
        FINALISTS.write_text("\n".join(json.dumps(o, ensure_ascii=False) for o in out) + "\n", encoding="utf-8")
        print(f"[final] wrote {FINALISTS}: {len(out)} finalists (of {len(keeps)} keep ids)")
        return

    obscure = [c for c in cands if verdicts.get(c["id"], {}).get("verdict") == "obscure"
               and c.get("safety_status") == "passed"]
    flagged = [c for c in cands if verdicts.get(c["id"], {}).get("verdict") == "flagged"
               or c.get("safety_status") == "dropped"]
    unverified = [c for c in cands if c["id"] in verdicts and verdicts[c["id"]].get("verdict") == "unverified"]

    # Review order: tier then score, so the owner reads a stable, comparable list.
    obscure.sort(key=lambda c: (c["draft_tier"], -c["score"]))
    page = ["<!DOCTYPE html><html><head><meta charset=utf-8><title>Kill-test taste read</title>",
            "<style>body{background:#0d0f16;color:#eee;font-family:monospace;max-width:920px;margin:40px auto;padding:0 20px}"
            "h2{color:#ffd166}pre{background:#161a26;padding:14px;border-radius:8px;white-space:pre-wrap;border-left:3px solid #ffd166}"
            ".stat{color:#8b93a7}.bad{color:#e2725b}.chip{display:inline-block;background:#161a26;padding:2px 8px;border-radius:6px;margin-right:6px}</style></head><body>",
            "<h1>Kill-test taste read (Arm K: obscure WORKING jokes)</h1>",
            f"<p class=stat>{len(obscure)} web-verified-obscure candidates. Reply with the ids to KILL "
            "(anything that isn't actually funny, reads stale, skews edgy/NSFW-adjacent, or that you "
            "PERSONALLY RECOGNIZE as a well-known joke - search can't index word-of-mouth fame, so your "
            "recognition is the backstop for exactly the confound this experiment studies). "
            "Target after your read: 50 items + 10 spares. Everything here already passed: upvote band 20-500, "
            "freshness scan, near-dup sweep, and web-obscurity verification (zero commentary hits).</p>"]
    for c in obscure:
        v = verdicts[c["id"]]
        page.append(f"<h2>{c['id']} <span class=chip>tier {c['draft_tier']}</span>"
                    f"<span class=chip>{c['score']} upvotes</span><span class=chip>{c['year']}</span></h2>")
        page.append("<pre>" + html.escape(c["text"]) + "</pre>")
        ev = "; ".join(f"{html.escape(e.get('title', ''))}: {html.escape(e.get('url', ''))}" for e in v.get("evidence", [])[:2])
        page.append(f"<p class=stat>search: {html.escape(v.get('query', ''))} &nbsp;|&nbsp; evidence: {ev or 'none (no relevant hits)'}</p>")
    page.append("</body></html>")
    REVIEW_HTML.write_text("\n".join(page), encoding="utf-8")

    print(f"[review] obscure={len(obscure)} flagged={len(flagged)} unverified={len(unverified)} missing_verification={len(missing)}")
    print(f"[review] wrote {REVIEW_HTML}")
    if len(obscure) < KEEP_TARGET_K1:
        print(f"[review] WARNING: only {len(obscure)} obscure candidates for a 60 (50+10) target")
    t1 = [c for c in obscure if c["draft_tier"] == 1]
    t2 = [c for c in obscure if c["draft_tier"] == 2]
    t3 = [c for c in obscure if c["draft_tier"] == 3]
    print(f"[review] obscure by tier: T1={len(t1)} T2={len(t2)} T3={len(t3)}")
    if missing:
        print(f"[review] ids with NO verification record: {missing[:10]}{'...' if len(missing) > 10 else ''}")


if __name__ == "__main__":
    main()

"""
Sources familiarity kill-test candidates (docs/10-familiarity-kill-test.md).

Arm K (core): obscure real WORKING jokes from rJokesData.
  Pre-registered selection criteria (docs/10 section 5):
    - real human-written, from the same corpus as the existing pools
    - working: upvote band 20-500 - enough strangers found it funny, far
      below the thousands where fame lives. The owner taste read remains the
      real quality gate; the band is the pre-filter.
    - obscure: enforced downstream by per-item web-search verification (this
      script's band is the cheap pre-filter, not the obscurity proof)
  Draw is from a SEEDED SHUFFLE over all band rows, not corpus order - the
  corpus file is ordered, and taking the first N band rows would sample one
  era of r/Jokes and one vote economy.
  Disjoint from EVERY existing pool: exact-text and Jaccard-0.6 near-dup
  checks against lol_a_items, lol_c_pools, the pilot, and the A candidates
  draft (some of those became live items; excluding all drafts is the safe
  direction for a confound-control experiment).
  Freshness scan applied at selection time - a stale joke reads broken and
  would confound the "working" cell.

Arm R (robustness): post-cutoff working jokes scraped fresh from r/Jokes.
  Attempted via the public JSON API; Reddit 403s datacenter IPs (measured
  2026-09-12), so the arm is deferred rather than faked. Do NOT fake it:
  the arm's entire value is that its items are verifiably post-cutoff.

Safety gate is DEFERRED to --safety-only: the explabs classifiers were in a
hard 429 storm at sourcing time (2026-09-12), and classify_one fails CLOSED
(unparseable/rate-limited = not appropriate), so classifying during a throttle
window would silently drop every candidate. Sequence: source -> web-verify
obscurity on the finalists -> safety-classify ONLY the finalists (half the
calls, run when the provider has cooled) -> owner taste read.

Output: data/killtest_candidates.jsonl - a DRAFT for web verification and the
owner taste read. Nothing downstream consumes it until it is promoted to
items with the quarantine-contracted runner (killtest_a.py).

Usage:
  python harness/source_killtest.py               # source Arm K (+ Arm R attempt)
  python harness/source_killtest.py --safety-only # classify existing candidates, prune
"""
import argparse
import json
import random
import re
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from run import load_env  # noqa: E402
from source_jokes import load_clean_rows  # noqa: E402
from freshness_check import flags_for  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
OUT_PATH = DATA_DIR / "killtest_candidates.jsonl"

SEED = 20260912
SCORE_LOW, SCORE_HIGH = 20, 500      # pre-registered fame band (docs/10 section 5)
TARGET = {"K1": 100, "K2": 50, "K3": 20}  # draft draws per tier; web-verification + taste read whittle these to 50+10


# Same heuristic as source_jokes.build_lol_a_candidates.tier_of (kept identical
# so kill-test items stratify cleanly against the existing T-tier means).
def tier_of(text):
    has_qa = bool(re.match(r"^\s*(what|why|how|who|where|when)\b.*\?", text, re.I))
    has_quote_word = bool(re.search(r'"[^"]{2,25}"', text))
    length = len(text)
    if (has_qa or has_quote_word) and length < 180:
        return 1
    if length > 320:
        return 3
    return 2


def _toks(t):
    return set(re.findall(r"[a-z]{3,}", t.lower()))


def load_existing_texts():
    """Every joke text already committed to any pool, live or draft."""
    files = [
        ("data/lol_a_items.jsonl", ["text"]),
        ("data/lol_c_pools.jsonl", ["joke_a", "joke_b"]),
        ("data/lol_a_pilot.jsonl", ["text"]),
        ("data/lol_a_f1f5_candidates_draft.jsonl", ["text"]),
    ]
    texts = []
    for rel, keys in files:
        p = ROOT / rel
        if not p.exists():
            continue
        for line in p.read_text(encoding="utf-8-sig").splitlines():
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except Exception:
                continue
            for k in keys:
                if row.get(k):
                    texts.append(row[k])
    return texts


def arm_k_candidates(existing):
    """Buffer every band row, seeded-shuffle, then draw quotas in shuffled
    order with freshness + near-dup checks applied per draw. Near-dup token
    sets for the existing pool are pre-tokenized once."""
    rng = random.Random(SEED)
    band = []
    n_rows = 0
    for text, score, year in load_clean_rows():
        n_rows += 1
        if n_rows % 200000 == 0:
            print(f"[arm-k] scanned {n_rows} clean rows, band_buffer={len(band)}", flush=True)
        if SCORE_LOW <= score <= SCORE_HIGH:
            band.append((text, score, year))
    print(f"[arm-k] corpus rows={n_rows}, band rows buffered={len(band)}", flush=True)
    rng.shuffle(band)

    seen_toks = [_toks(s) for s in existing]
    per_tier_drawn = {"K1": 0, "K2": 0, "K3": 0}
    out = []
    n_fresh = n_dedup = 0
    for text, score, year in band:
        if len(out) >= sum(TARGET.values()):
            break
        tier = tier_of(text)
        key = f"K{tier}"
        if per_tier_drawn.get(key, 0) >= TARGET.get(key, 0):
            continue
        if flags_for(text):
            n_fresh += 1
            continue
        toks = _toks(text)
        if any(len(toks & st) / len(toks | st) >= 0.6 for st in seen_toks if st):
            n_dedup += 1
            continue
        seen_toks.append(toks)
        per_tier_drawn[key] += 1
        out.append({
            "id": f"K-CAND-{len(out):04d}",
            "text": text,
            "draft_tier": tier,
            "score": score,
            "year": year,
            "source": "rJokesData (github.com/orionw/rJokesData)",
            "safety_status": "pending",
        })
    print(f"[arm-k] drawn={len(out)} per_tier={per_tier_drawn} freshness_flagged={n_fresh} near_dups_dropped={n_dedup}", flush=True)
    years = sorted(c["year"] for c in out)
    if years:
        print(f"[arm-k] year spread {years[0]}-{years[-1]} (corpus-wide draw check)", flush=True)
    return out


def arm_r_candidates(existing, n_target=40):
    """Post-cutoff working jokes, scraped live. Band applies to the post's
    current score; created_utc must be 2025+ so the joke is younger than any
    candidate model's training data."""
    url = "https://www.reddit.com/r/Jokes/top.json?t=year&limit=100"
    req = urllib.request.Request(url, headers={"User-Agent": "lolbench-sourcing/0.1 (research; contact via github.com/YakshithK/lolbench)"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        print(f"[arm-r] reddit fetch failed ({e}) - arm deferred, not faked", flush=True)
        return []
    from datetime import datetime, timezone
    out = []
    seen = list(existing)
    for child in data.get("data", {}).get("children", []):
        d = child.get("data", {})
        title = (d.get("title") or "").strip()
        body = (d.get("selftext") or "").strip()
        if not title or not body or d.get("over_18"):
            continue
        text = re.sub(r"\s+", " ", f"{title} {body}").strip()
        if not (40 <= len(text) <= 600) or "�" in text:
            continue
        ups = int(d.get("ups") or 0)
        if not (SCORE_LOW <= ups <= SCORE_HIGH):
            continue
        ts = float(d.get("created_utc") or 0)
        year = datetime.fromtimestamp(ts, tz=timezone.utc).year
        if year < 2025:
            continue
        if flags_for(text) or any(_toks(text) & _toks(s) and
                                  len(_toks(text) & _toks(s)) / len(_toks(text) | _toks(s)) >= 0.6 for s in seen):
            continue
        seen.append(text)
        out.append({
            "id": f"R-CAND-{len(out):04d}",
            "text": text,
            "draft_tier": tier_of(text),
            "score": ups,
            "year": year,
            "source": "r/Jokes live scrape (created_utc recorded)",
            "safety_status": "pending",
        })
        if len(out) >= n_target:
            break
    print(f"[arm-r] drew {len(out)} post-cutoff candidates", flush=True)
    return out


def safety_only(only_verified=False):
    """Classify candidates that are still 'pending', prune failures, rewrite.
    Paced: sleep between texts so a throttled provider can recover mid-run
    instead of burning all retries in the first seconds (the 429-storm lesson).

    only_verified: classify only candidates the web-verification batches have
    already marked 'obscure' (safety runs while searches continue; flagged
    jokes don't deserve classifier calls)."""
    load_env()
    from safety_filter import is_appropriate
    rows = [json.loads(l) for l in OUT_PATH.read_text(encoding="utf-8-sig").splitlines() if l.strip()]
    allowed = None
    if only_verified:
        allowed = set()
        for p in sorted(DATA_DIR.glob("killtest_verify_batch*.jsonl")):
            for line in p.read_text(encoding="utf-8-sig").splitlines():
                if not line.strip():
                    continue
                try:
                    r = json.loads(line)
                except Exception:
                    continue
                if r.get("verdict") == "obscure":
                    allowed.add(r["id"])
        print(f"[safety] only-verified mode: {len(allowed)} verified-obscure candidates", flush=True)
    pending = [r for r in rows if r.get("safety_status") == "pending" and (allowed is None or r["id"] in allowed)]
    print(f"[safety] {len(pending)}/{len(rows)} candidates pending classification", flush=True)
    kept, dropped = 0, 0
    for i, r in enumerate(rows):
        if r.get("safety_status") != "pending":
            kept += 1 if r.get("safety_status") == "passed" else 0
            continue
        if allowed is not None and r["id"] not in allowed:
            continue
        if is_appropriate(r["text"]):
            r["safety_status"] = "passed"
            kept += 1
        else:
            r["safety_status"] = "dropped"
            dropped += 1
        if (i + 1) % 10 == 0:
            print(f"[safety] {i + 1}/{len(rows)} done (kept={kept}, dropped={dropped})", flush=True)
            time.sleep(5)  # pace: let per-window throttles drain between batches
    survivors = [r for r in rows if r.get("safety_status") == "passed"]
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"[safety] final: {len(survivors)} passed, {dropped} dropped (fail-closed on errors)", flush=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--safety-only", action="store_true", help="classify pending candidates in place, prune failures")
    ap.add_argument("--only-verified", action="store_true", help="with --safety-only: classify only web-verified-obscure candidates")
    ap.add_argument("--skip-arm-r", action="store_true")
    args = ap.parse_args()

    if args.safety_only:
        safety_only(only_verified=args.only_verified)
        return

    existing = load_existing_texts()
    print(f"[existing] {len(existing)} pool texts loaded for disjointness", flush=True)

    cands = arm_k_candidates(existing)
    if not args.skip_arm_r:
        cands += arm_r_candidates(existing)
    for i, c in enumerate(cands):
        c["id"] = f"{c['id'][:1]}-CAND-{i:04d}"

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        for c in cands:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")
    tiers = {}
    for c in cands:
        tiers[c["draft_tier"]] = tiers.get(c["draft_tier"], 0) + 1
    print(f"[write] {OUT_PATH}: {len(cands)} candidates (safety deferred to --safety-only), tiers={tiers}", flush=True)


if __name__ == "__main__":
    main()

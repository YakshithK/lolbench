"""
Sources LOL-A tiering candidates and LOL-C paired ground-truth data from the
rJokesData corpus (github.com/orionw/rJokesData, Weller & Seppi, LREC 2020) -
550k+ real r/Jokes posts with real historical upvote counts attached.

Score field is the RAW upvote count from data/preprocessed.csv (NOT the
log-transformed version used in that repo's own train/dev/test.tsv - we want
the real gap between two jokes' scores for LOL-C pairing, not a log bucket).

A real, verified data-quality bug in the source file: some joke texts contain
unescaped commas that shift every column after them, so `date` lands as an
empty field, `score` lands with what should have been the punchline's row
data, etc. Confirmed by inspection: corrupted rows have date == None while
every genuinely valid row has a parseable date. Filtering on date is not None
removes them (measured: ~0.035% of rows, so this costs us nothing).

Output:
  - data/lol_c_pools.jsonl   : real, final path (reserved in config.yaml).
    Nothing in the harness consumes this yet, so populating it is free of
    any run cost - safe to write directly.
  - data/lol_a_f1f5_candidates_draft.jsonl : DRAFT, deliberately NOT written
    to data/lol_a_items.jsonl. That file is live - run.py/judge.py act on it
    immediately and cost real API spend. This draft is for human review
    (tier assignments are a rough automatic first pass, not validated) before
    anyone decides to wire it in and bump dataset_version.
"""
import csv
import gzip
import hashlib
import json
import random
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from run import load_env  # noqa: E402
from safety_filter import filter_pool  # noqa: E402

csv.field_size_limit(2**28)

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
RAW_URL = "https://raw.githubusercontent.com/orionw/rJokesData/master/data/preprocessed.csv.gz"
RAW_GZ = DATA_DIR / "private" / "rjokes_preprocessed.csv.gz"
RAW_CSV = DATA_DIR / "private" / "rjokes_preprocessed.csv"

# dadjokes: Apache 2.0 licensed (unlike rJokesData, which inherits Reddit's
# own ToS), community-self-selected for family-friendly content, but ships
# with NO vote-score data - useless for LOL-C's score-gap pairing, but a
# clean, legally simpler source of short Q/A-format jokes for LOL-A's easy
# tier specifically.
DADJOKES_CSV = DATA_DIR / "private" / "dadjokes_train.csv"

SEED = 20260904  # fixed for reproducibility - same sample every run

# Crude, deliberately conservative NSFW/slur blocklist for a public benchmark
# site. This is NOT a substitute for a human skim of the final selected pool -
# flagging that explicitly rather than pretending a keyword list is a
# complete content filter.
BLOCK_TERMS = [
    "nigger", "faggot", "retard", "rape", "pedo", "molest", "nazi",
    "cunt", "chink", "spic", "kike", "tranny",
]
BLOCK_RE = re.compile("|".join(re.escape(t) for t in BLOCK_TERMS), re.I)


def download():
    RAW_GZ.parent.mkdir(parents=True, exist_ok=True)
    if not RAW_GZ.exists():
        print(f"[download] fetching {RAW_URL}", flush=True)
        urllib.request.urlretrieve(RAW_URL, RAW_GZ)
    if not RAW_CSV.exists():
        print("[download] decompressing", flush=True)
        with gzip.open(RAW_GZ, "rb") as fin, open(RAW_CSV, "wb") as fout:
            fout.write(fin.read())
    print(f"[download] ready: {RAW_CSV} ({RAW_CSV.stat().st_size / 1e6:.1f} MB)", flush=True)


def load_clean_rows():
    """Yields (text, score, year) for every row that passes the corruption
    check, a minimum length, and dedup. Text is joke+body+punchline
    concatenated (rJokesData splits single-line jokes across these three
    columns inconsistently; for our purposes we just need the full text)."""
    seen_hashes = set()
    n_total = n_corrupt = n_short = n_dup = n_blocked = n_kept = 0
    with open(RAW_CSV, encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            n_total += 1
            if row.get("date") is None:
                n_corrupt += 1
                continue
            try:
                ts = float(row["date"])
                score = int(float(row["score"]))
            except (TypeError, ValueError):
                n_corrupt += 1
                continue
            if score < 0 or score > 200000:  # sanity bound, not a real Reddit ceiling but catches residual corruption
                n_corrupt += 1
                continue
            # Reconstruction rule, chosen from a measured audit of the corpus
            # (see the temp audit scripts referenced in session): ~85% of rows
            # have one field fully containing the other (title = full joke,
            # body = verbatim prefix, or vice versa) - picking the longer is
            # correct there. ~15% have a setup in the title and the punchline
            # in the body with NO containment - picking either truncates the
            # joke mid-story (the bug that produced "jokes beginning mid-story"
            # in earlier drafts), so those get concatenated.
            joke_t = (row.get("joke") or "").strip()
            body_t = (row.get("body") or "").strip()

            def _norm(s):
                return re.sub(r"\s+", " ", s).strip().lower()

            jn, bn = _norm(joke_t), _norm(body_t)
            if not body_t:
                text = joke_t
            elif not joke_t:
                text = body_t
            elif bn in jn:
                text = joke_t  # title contains the body (preview or preamble)
            elif jn in bn:
                text = body_t  # body contains the title
            else:
                text = joke_t + " " + body_t  # setup/punchline split across fields
            text = re.sub(r"\s+", " ", text).strip()
            if len(text) < 40 or len(text) > 600:
                n_short += 1
                continue
            if "�" in text:  # source-data corruption (mangled apostrophes/quotes from the original 2019 scrape), not fixable by re-decoding - confirmed the file itself decodes as clean strict UTF-8
                n_corrupt += 1
                continue
            h = hashlib.sha1(text.lower().encode()).hexdigest()
            if h in seen_hashes:
                n_dup += 1
                continue
            seen_hashes.add(h)
            if BLOCK_RE.search(text):
                n_blocked += 1
                continue
            year = datetime.fromtimestamp(ts, tz=timezone.utc).year
            n_kept += 1
            yield text, score, year
    print(
        f"[clean] total={n_total} corrupt={n_corrupt} too_short_or_long={n_short} "
        f"dup={n_dup} blocked={n_blocked} kept={n_kept}",
        flush=True,
    )


def build_lol_c_pairs(rows, n_pairs=600):
    """Pairs a clearly-higher-scored joke against a clearly-lower-scored one,
    same year (controls for era/subreddit-size effects on vote counts), with
    a real minimum score gap (not just log-bucket difference) so the ground
    truth isn't built on noise. Each joke used in at most one pair."""
    by_year = {}
    for text, score, year in rows:
        by_year.setdefault(year, []).append((text, score))

    rng = random.Random(SEED)
    pairs = []
    for year, items in sorted(by_year.items()):
        if len(items) < 20:
            continue
        items = items[:]
        rng.shuffle(items)
        items.sort(key=lambda x: -x[1])
        n = len(items)
        high = items[: n // 3]
        # Low side: only posts with a real score floor. A 0-upvote post on
        # r/Jokes is usually spam, a broken repost, or never seen at all -
        # not "unfunny." Measured on the first 59-pair draft: 53 of 59 losers
        # had score 0 or 1, which would grade models on coherence detection,
        # not taste. Floor of 5 means real humans saw it and declined.
        low_pool = [x for x in items if x[1] >= 5]
        low = low_pool[2 * len(low_pool) // 3 :]
        rng.shuffle(high)
        rng.shuffle(low)
        for h, l in zip(high, low):
            if h[1] - l[1] < 5:  # require a real absolute gap, not just tercile membership
                continue
            pairs.append({"year": year, "joke_high": h[0], "score_high": h[1], "joke_low": l[0], "score_low": l[1]})

    rng.shuffle(pairs)
    pairs = pairs[:n_pairs]

    out = []
    for i, p in enumerate(pairs):
        # Randomize which side is "A" so a model can't win by always guessing
        # one letter - winner is recorded, not implied by position.
        flip = rng.random() < 0.5
        joke_a, score_a = (p["joke_low"], p["score_low"]) if flip else (p["joke_high"], p["score_high"])
        joke_b, score_b = (p["joke_high"], p["score_high"]) if flip else (p["joke_low"], p["score_low"])
        winner = "B" if flip else "A"
        out.append({
            "id": f"C-{i:04d}",
            "joke_a": joke_a,
            "joke_b": joke_b,
            "winner": winner,
            "score_a": score_a,
            "score_b": score_b,
            "year": p["year"],
            "source": "rJokesData (github.com/orionw/rJokesData)",
        })
    return out


def build_lol_a_candidates(rows, used_texts, n=600):
    """Draws a sample disjoint from whatever LOL-C already used, and applies
    a ROUGH, automatic, heuristic first-pass tier assignment - not validated
    against any ground truth, and explicitly not meant to be final without a
    human skim. The heuristic looks only at surface structure (format,
    length), not semantic difficulty, which a script can't judge without
    reintroducing an LLM-opinion-as-ground-truth problem."""
    pool = [(t, s, y) for t, s, y in rows if t not in used_texts]
    rng = random.Random(SEED + 1)
    rng.shuffle(pool)

    # Tier 3 (hard) needs a targeted draw: the corpus is short-joke dominated
    # (median ~100 chars), so random sampling yields only ~7 tier-3 items per
    # 600 - measured on the first draft. Long-form narrative jokes (the
    # benign-violation / story territory closest to F6's "judge it" mode) are
    # plentiful in the corpus, they just never win a random draw.
    TIER3_TARGET = 60
    long_pool = [x for x in pool if len(x[0]) > 320]  # matches tier_of's tier-3 threshold exactly
    rng.shuffle(long_pool)
    tier3_draw = set(t for t, s, y in long_pool[:TIER3_TARGET])
    rest_pool = [x for x in pool if x[0] not in tier3_draw]
    pool = long_pool[:TIER3_TARGET] + rest_pool
    pool = pool[: n + TIER3_TARGET]

    def tier_of(text):
        # Broadened from a literal "Q:" prefix, which almost never appears -
        # most r/Jokes posts phrase the setup as a bare question ("What do
        # you call...?", "Why did...?") with no "Q:" label at all.
        has_qa = bool(re.match(r"^\s*(what|why|how|who|where|when)\b.*\?", text, re.I))
        has_quote_word = bool(re.search(r'"[^"]{2,25}"', text))
        length = len(text)
        if (has_qa or has_quote_word) and length < 180:
            return 1  # short, structurally marked as a Q/A or pun-quoted format
        if length > 320:
            return 3  # long-form narrative - more likely benign-violation/story style, closer to F6's "judge it" territory
        return 2

    out = []
    for i, (text, score, year) in enumerate(pool):
        out.append({
            "id": f"A-CAND-{i:04d}",
            "text": text,
            "draft_tier": tier_of(text),
            "year": year,
            "source": "rJokesData (github.com/orionw/rJokesData)",
        })
    return out


def load_dadjokes(n=300, seed=SEED + 2):
    """question+response are the setup+punchline; dadjokes' own filter
    (5+ votes) already ran, we just concatenate and length-filter."""
    import csv as csv_mod
    rows = []
    with open(DADJOKES_CSV, encoding="utf-8", errors="replace") as f:
        r = csv_mod.DictReader(f)
        for row in r:
            q, a = (row.get("question") or "").strip(), (row.get("response") or "").strip()
            if not q or not a:
                continue
            text = re.sub(r"\s+", " ", f"{q} {a}")
            if 20 <= len(text) <= 300 and "�" not in text and not BLOCK_RE.search(text):
                rows.append(text)
    rng = random.Random(seed)
    rng.shuffle(rows)
    return rows[:n]


def main():
    download()
    rows = list(load_clean_rows())

    c_pairs = build_lol_c_pairs(rows, n_pairs=600)
    used_texts = set()
    for p in c_pairs:
        used_texts.add(p["joke_a"])
        used_texts.add(p["joke_b"])

    a_candidates = build_lol_a_candidates(rows, used_texts, n=300)
    dadjoke_texts = load_dadjokes(n=300)
    for i, text in enumerate(dadjoke_texts):
        # Tier 1 BY CONSTRUCTION, not by measurement - deliberate choice, see below.
        # The tier_of() heuristic below is structurally blind on dadjokes: its
        # Q/A test anchors at string start, but dadjokes arrive as setup +
        # punchline already joined, so the question shape sits mid-string and
        # never fires (measured: all 220 would default to tier 2, not because
        # they are hard but because the detector cannot see their structure).
        # Rather than reshape the heuristic around one source, dadjokes - a
        # corpus that is short Q/A puns by editorial selection - are assigned
        # tier 1 directly. Risk accepted: culture-heavy dad jokes that are
        # genuinely tier-2 will hide in tier 1. The check is post-hoc, not
        # a priori: after the run, compare dadjokes-sourced vs rJokes-sourced
        # tier-1 means. Equal => the force was harmless. Diverged =>
        # revisit with per-setup tiering (the question/answer split exists
        # upstream in load_dadjokes and can be tiered on the setup half).
        a_candidates.append({
            "id": f"A-DAD-{i:04d}",
            "text": text,
            "draft_tier": 1,
            "year": None,
            "source": "dadjokes (huggingface.co/datasets/shuttie/dadjokes, Apache 2.0)",
        })

    overlap = used_texts & {c["text"] for c in a_candidates}
    print(f"[verify] overlap between LOL-C jokes and LOL-A candidates (pre-safety-filter): {len(overlap)} (must be 0)", flush=True)

    # --- content-safety pass: both B.AI classifiers must agree, see safety_filter.py ---
    load_env()
    all_c_texts = list(used_texts)
    all_a_texts = [c["text"] for c in a_candidates]
    print(f"[safety] classifying {len(all_c_texts)} LOL-C jokes + {len(all_a_texts)} LOL-A candidates ({len(all_c_texts) + len(all_a_texts)} total calls x2 models)...", flush=True)
    c_passed = filter_pool(all_c_texts, label="lol-c")
    a_passed = filter_pool(all_a_texts, label="lol-a")

    c_pairs_final = [p for p in c_pairs if p["joke_a"] in c_passed and p["joke_b"] in c_passed]
    a_candidates_final = [c for c in a_candidates if c["text"] in a_passed]

    for i, p in enumerate(c_pairs_final):
        p["id"] = f"C-{i:04d}"
    for i, c in enumerate(a_candidates_final):
        c["id"] = f"A-CAND-{i:04d}"

    # Near-duplicate sweep (Jaccard >= 0.6 on alpha-token sets): the exact-
    # string dedup in load_clean_rows misses reworded reposts, and rJokes is
    # full of them. Measured 2026-09: the "attire/tire" unicycle joke survived
    # in C twice (scores 741 AND 23 - direct evidence scores track virality,
    # not just funniness) plus once in the A pool. Same mechanism tested 3x
    # across 2 tracks. Drop later-seen near-dups; report everything dropped.
    def _toks(t):
        return set(re.findall(r"[a-z]{3,}", t.lower()))

    def _near(a, b, thresh=0.6):
        sa, sb = _toks(a), _toks(b)
        return bool(sa and sb) and len(sa & sb) / len(sa | sb) >= thresh

    kept_pairs, dropped_pairs = [], []
    seen_texts = []
    for p in c_pairs_final:
        if any(_near(p["joke_a"], s) or _near(p["joke_b"], s) for s in seen_texts):
            dropped_pairs.append(p["id"])
            continue
        kept_pairs.append(p)
        seen_texts.extend([p["joke_a"], p["joke_b"]])
    kept_a, dropped_a = [], []
    for c in a_candidates_final:
        if any(_near(c["text"], s) for s in seen_texts):
            dropped_a.append(c["id"])
            continue
        kept_a.append(c)
        seen_texts.append(c["text"])
    print(f"[dedup] dropped {len(dropped_pairs)} C pairs, {len(dropped_a)} A candidates as near-dups", flush=True)
    if dropped_pairs:
        print(f"  C dropped: {dropped_pairs}", flush=True)
    if dropped_a:
        print(f"  A dropped: {dropped_a}", flush=True)
    c_pairs_final, a_candidates_final = kept_pairs, kept_a
    for i, p in enumerate(c_pairs_final):
        p["id"] = f"C-{i:04d}"
    for i, c in enumerate(a_candidates_final):
        c["id"] = f"A-CAND-{i:04d}"

    c_path = DATA_DIR / "lol_c_pools.jsonl"
    with open(c_path, "w", encoding="utf-8") as f:
        for p in c_pairs_final:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")
    print(f"[write] {c_path}: {len(c_pairs_final)}/{len(c_pairs)} pairs survived safety filter", flush=True)

    a_path = DATA_DIR / "lol_a_f1f5_candidates_draft.jsonl"
    with open(a_path, "w", encoding="utf-8") as f:
        for c in a_candidates_final:
            f.write(json.dumps(c, ensure_ascii=False) + "\n")
    tier_counts = {}
    source_counts = {}
    for c in a_candidates_final:
        tier_counts[c["draft_tier"]] = tier_counts.get(c["draft_tier"], 0) + 1
        src = "dadjokes" if "dadjokes" in c["source"] else "rJokesData"
        source_counts[src] = source_counts.get(src, 0) + 1
    print(f"[write] {a_path}: {len(a_candidates_final)}/{len(a_candidates)} candidates survived, tier counts={tier_counts}, source counts={source_counts}", flush=True)

    overlap_final = {p["joke_a"] for p in c_pairs_final} | {p["joke_b"] for p in c_pairs_final}
    overlap_final &= {c["text"] for c in a_candidates_final}
    print(f"[verify] final overlap between LOL-C and LOL-A pools: {len(overlap_final)} (must be 0)", flush=True)


if __name__ == "__main__":
    main()

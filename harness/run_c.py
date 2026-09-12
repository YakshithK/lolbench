"""LOL-C taste/discrimination track.

For each enabled candidate, for each of the 130 pairs in
data/lol_c_pools.jsonl: show the model both jokes exactly as stored and ask
which one the reference human audience found funnier. The model itself picks;
scoring compares the pick to the recorded winner. There is NO judge LLM in
this track, so family-disjoint judge exclusion does not apply: every model
judges all 130 pairs, including same-family content.

Ground-truth upvote scores are NEVER shown to the model (that would leak the
answer); only the joke texts go in the prompt, A/B sides exactly as stored
(no re-randomization).

Conventions reused from run.py (not reimplemented): chat(), load_env(),
append_result(), spend_exceeded(), throttle() (inside chat), MODEL_PRICES
(inside record_cost), parallel_workers. Checkpointing follows the done_keys
pattern, except a pair counts as done only once a row with a non-null pick
exists (judge.py's judgment_done_keys precedent): a transient provider
outage must not permanently blank pairs the way a quota storm once did for
judgments. Scoring dedupes rows by pair id, latest line wins.

Writes (new files only):
  outputs_c/<model>/lol_c.jsonl   per-pair picks (item_id, sample 0, pick, reason)
  results/lol_c_results.json       per-model accuracy + CI + A-vs-C correlation
Reads (never writes): harness/config.yaml, data/lol_c_pools.jsonl,
site/results.json (LOL-A means for the correlation).

Usage:
  python harness/run_c.py [only] [--limit N] [--score-only]
"""

import argparse
import json
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from run import (  # noqa: E402
    ROOT,
    CFG,
    PRINT_LOCK,
    append_result,
    chat,
    load_env,
    load_jsonl,
    spend_exceeded,
)
from score import bootstrap_ci, mean  # noqa: E402

C_TEMPERATURE = 0.0  # taste judgment, not diverse generation: single deterministic sample
C_MAX_TOKENS = 2048  # strict JSON + one sentence content is short, but reasoning
# models burn hidden tokens first: muse-spark-1.2 via hackclub spent 509/512
# budget tokens on reasoning and returned content=None (finish=length), the
# same failure mode config.yaml documents for hy4-preview. 2048 leaves room
# for reasoning + answer; paid ceiling prices already cover hidden tokens.
C_ATTEMPTS = 3  # LLM re-asks per pair on parse failure / transient error
C_BACKOFF = [2.0, 4.0]  # sleeps between re-asks (chat() already backs off internally on 429/5xx)
FREE_PROVIDERS = {"bai", "hackclub"}  # these never consume max_spend_usd

PROMPT_TEMPLATE = (
    "You are judging human taste in jokes, not telling one yourself.\n"
    "Two jokes (A and B) were posted on Reddit. A large human audience "
    "upvoted one of them clearly more than the other.\n"
    "\n"
    "Joke A:\n{joke_a}\n"
    "\n"
    "Joke B:\n{joke_b}\n"
    "\n"
    "Which joke did the human audience find funnier? "
    'Reply with STRICT JSON only, no other text: {{"pick": "A", "reason": "<one sentence>"}} '
    'where pick is "A" or "B".'
)

JSON_RE = re.compile(r"\{.*\}", re.S)
PICK_FALLBACK_RE = re.compile(r'"pick"\s*:\s*"([ABab])"')


def extract_pick(text):
    """Return (pick, reason) or (None, None). Accepts A/B case-insensitively."""
    if not text or not text.strip():
        return None, None
    m = JSON_RE.search(text)
    if m:
        try:
            o = json.loads(m.group(0))
            pick = o.get("pick")
            if isinstance(pick, str) and pick.strip().upper() in ("A", "B"):
                reason = o.get("reason")
                return pick.strip().upper(), reason if isinstance(reason, str) else ""
        except Exception:
            pass
    m2 = PICK_FALLBACK_RE.search(text)
    if m2:
        return m2.group(1).upper(), ""
    return None, None


def c_done_keys(path):
    """Pairs with at least one non-null pick row. Null rows (persistent
    provider failure / unparseable output) retry on the next run instead of
    blanking the pair forever. Scoring dedupes by pair id, latest wins."""
    keys = set()
    if path.exists():
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            if line.strip():
                try:
                    o = json.loads(line)
                    if o.get("pick") in ("A", "B"):
                        keys.add(o["item_id"])
                except Exception:
                    pass
    return keys


def run_candidate(cand, pairs):
    name = cand["name"]
    base_url = cand.get("base_url")
    provider = cand["provider"]
    model = cand["model"]
    workers = max(1, int(CFG.get("parallel_workers", 1)))
    paid = provider not in FREE_PROVIDERS
    lock = threading.Lock()
    # think: false -> disable reasoning via OpenRouter's unified param (cost control)
    extra = {"reasoning": {"enabled": False}} if (cand.get("think") is False and provider == "openrouter") else None

    out = ROOT / "outputs_c" / name / "lol_c.jsonl"
    done = c_done_keys(out)
    tasks = [p for p in pairs if p["id"] not in done]
    print(f"[c] {name}: {len(tasks)} calls to make ({len(done)} already done)", flush=True)

    def c_worker(pair):
        pid = pair["id"]
        if paid and spend_exceeded():
            with PRINT_LOCK:
                print(f"[spend-guard] skipping {name} {pid}: max_spend_usd reached", flush=True)
            return
        prompt = PROMPT_TEMPLATE.format(joke_a=pair["joke_a"], joke_b=pair["joke_b"])
        pick, reason, raw, error = None, "", "", None
        try:
            for attempt in range(C_ATTEMPTS):
                try:
                    raw = chat(
                        provider, model, base_url,
                        [{"role": "user", "content": prompt}],
                        C_TEMPERATURE, C_MAX_TOKENS,
                        cost_key=name, extra_payload=extra,
                    )
                except Exception as e:
                    error = f"{type(e).__name__}: {e}"
                    with PRINT_LOCK:
                        print(f"[warn] {name} {pid} attempt {attempt + 1}: {error}", flush=True)
                    if attempt < C_ATTEMPTS - 1:
                        time.sleep(C_BACKOFF[min(attempt, len(C_BACKOFF) - 1)])
                    continue
                pick, reason = extract_pick(raw)
                if pick is not None:
                    error = None
                    break
                error = "unparseable output"
                with PRINT_LOCK:
                    print(f"[warn] {name} {pid} attempt {attempt + 1}: unparseable output", flush=True)
                if attempt < C_ATTEMPTS - 1:
                    time.sleep(C_BACKOFF[min(attempt, len(C_BACKOFF) - 1)])
        except Exception as e:  # never crash the run
            error = f"{type(e).__name__}: {e}"
            with PRINT_LOCK:
                print(f"[warn] {name} {pid}: {error}", flush=True)
        append_result(out, {
            "item_id": pid,
            "sample": 0,
            "pick": pick,
            "reason": reason if pick is not None else (error or ""),
            "error": error,
            "model": name,
            "ts": time.time(),
        }, lock)
        with PRINT_LOCK:
            print(f"[c] {name} {pid} -> {pick}", flush=True)

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(c_worker, tasks))


def _ranks(xs):
    order = sorted(range(len(xs)), key=lambda i: xs[i])
    r = [0.0] * len(xs)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and xs[order[j + 1]] == xs[order[i]]:
            j += 1
        avg = (i + j) / 2.0 + 1  # 1-based, ties averaged
        for k in range(i, j + 1):
            r[order[k]] = avg
        i = j + 1
    return r


def spearman(a, b):
    """Rank correlation (Spearman rho) with tie-averaged ranks. No scipy dependency."""
    if len(a) != len(b) or len(a) < 2:
        return None
    ra, rb = _ranks(a), _ranks(b)
    ma, mb = mean(ra), mean(rb)
    cov = sum((x - ma) * (y - mb) for x, y in zip(ra, rb))
    va = sum((x - ma) ** 2 for x in ra)
    vb = sum((y - mb) ** 2 for y in rb)
    if va <= 0 or vb <= 0:
        return 0.0
    return round(cov / ((va * vb) ** 0.5), 4)


def score_all():
    """Per-model accuracy vs recorded winner + bootstrap CI, plus Spearman
    rank correlation of LOL-C accuracy against LOL-A means (site/results.json,
    read-only). Writes results/lol_c_results.json; prints a sorted table."""
    pools = {p["id"]: p for p in load_jsonl(ROOT / CFG["paths"]["pools_c"])}
    n_pairs = len(pools)
    enabled = [c for c in CFG["candidates"] if c.get("enabled")]

    site_path = ROOT / CFG["paths"]["site_results"]
    lol_a_means = {}
    if site_path.exists():
        site = json.loads(site_path.read_text(encoding="utf-8-sig"))
        for m, v in (site.get("lol_a") or {}).items():
            if isinstance(v, dict) and "mean" in v:
                lol_a_means[m] = float(v["mean"])

    models = {}
    for cand in enabled:
        name = cand["name"]
        p = ROOT / "outputs_c" / name / "lol_c.jsonl"
        latest = {}
        if p.exists():
            for line in p.read_text(encoding="utf-8-sig").splitlines():
                if line.strip():
                    try:
                        o = json.loads(line)
                        latest[o["item_id"]] = o
                    except Exception:
                        pass
        hits = []
        n_null = 0
        for pid, row in latest.items():
            if pid not in pools:
                continue
            if row.get("pick") in ("A", "B"):
                hits.append(1.0 if row["pick"] == pools[pid]["winner"] else 0.0)
            else:
                n_null += 1
        acc = round(mean(hits), 4) if hits else 0.0
        models[name] = {
            "accuracy": acc,
            "ci95": bootstrap_ci(hits),
            "n": len(hits),
            "n_null": n_null,
            "n_pairs": n_pairs,
        }

    common = [m for m in models if models[m]["n"] > 0 and m in lol_a_means]
    rho = spearman([models[m]["accuracy"] for m in common], [lol_a_means[m] for m in common]) if len(common) >= 2 else None
    correlation = {
        "spearman_a_vs_c": rho,
        "n_models": len(common),
        "models": common,
    }

    results = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dataset_version": CFG.get("dataset_version"),
        "n_pairs": n_pairs,
        "temperature": C_TEMPERATURE,
        "models": models,
        "lol_a_means": {m: lol_a_means[m] for m in common},
        "correlation_a_vs_c": correlation,
    }
    out = ROOT / CFG["paths"]["results"] / "lol_c_results.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"wrote {out}")

    print(f"{'model':<18}{'acc':>8}{'ci95':>22}{'n':>6}{'a_mean':>8}")
    for m in sorted(models, key=lambda m: models[m]["accuracy"], reverse=True):
        v = models[m]
        print(f"{m:<18}{v['accuracy']:>8.4f}{str(v['ci95']):>22}{v['n']:>6}{lol_a_means.get(m, float('nan')):>8.4f}")
    print(f"spearman(A-mean vs C-acc): {rho} on {len(common)} models")
    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("only", nargs="?", default=None, help="run a single candidate by name")
    parser.add_argument("--limit", type=int, default=None, help="cap pairs (smoke tests)")
    parser.add_argument("--score-only", action="store_true", help="skip generation, only score + write results")
    args = parser.parse_args()

    load_env()
    if not args.score_only:
        pairs = load_jsonl(ROOT / CFG["paths"]["pools_c"])
        if args.limit:
            pairs = pairs[: args.limit]
        cands = [c for c in CFG["candidates"] if c.get("enabled")]
        if args.only:
            cands = [c for c in cands if c["name"] == args.only]
            if not cands:
                print(f"candidate '{args.only}' not found or not enabled")
                return
        if not cands:
            print("No enabled candidates in harness/config.yaml.")
            return
        for cand in cands:
            print(f"=== {cand['name']} ===", flush=True)
            run_candidate(cand, pairs)
    score_all()
    print("run_c complete")


if __name__ == "__main__":
    main()

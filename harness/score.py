import hashlib
import json
import random
import re
from datetime import datetime, timezone
from pathlib import Path

import yaml

from run import MODEL_PRICES, ESTIMATED_PRICE_MODELS


def strip_think(text):
    return re.sub(r"<think>.*?</think>", "", text, flags=re.S).strip()

ROOT = Path(__file__).resolve().parents[1]
CFG = yaml.safe_load((ROOT / "harness" / "config.yaml").read_text(encoding="utf-8"))


def enabled_candidates():
    return {c["name"] for c in CFG["candidates"] if c.get("enabled")}


def mean(xs):
    return sum(xs) / len(xs) if xs else 0.0


def bootstrap_ci(xs, iters=1000, seed=42):
    if len(xs) < 2:
        m = mean(xs)
        return [m, m]
    rng = random.Random(seed)
    ms = sorted(mean([rng.choice(xs) for _ in xs]) for _ in range(iters))
    lo, hi = ms[int(0.025 * iters)], ms[int(0.975 * iters)]
    # Small-sample floor: resampling a near-constant handful produces a
    # degenerate interval (3-for-3 shows as 100 +/- 0). Wilson's 95% interval
    # on the mean-as-proportion is the standard honest floor for tiny n.
    n = len(xs)
    if n < 30:
        p = mean(xs)
        z = 1.96
        denom = 1 + z * z / n
        center = (p + z * z / (2 * n)) / denom
        half = z * ((p * (1 - p) / n + z * z / (4 * n * n)) ** 0.5) / denom
        lo, hi = min(lo, center - half), max(hi, center + half)
    return [round(max(0.0, lo), 4), round(min(1.0, hi), 4)]


def harness_hash():
    h = hashlib.sha256()
    for rel in [
        "harness/config.yaml",
        "harness/prompts/explain.md",
        "harness/prompts/generate.md",
        "harness/prompts/judge.md",
        CFG["paths"]["items_a"],
        CFG["paths"]["premises_b"],
    ]:
        p = ROOT / rel
        if p.exists():
            h.update(p.read_bytes())
            h.update(b"\x00")
    return h.hexdigest()[:16]


REFUSAL_RE = re.compile(
    r"not provided|were not provided|was not provided|cannot be (evaluated|graded|verified)",
    re.I,
)


def load_valid_judgments(jpath):
    """Dedupe by (judge, model, item, sample), latest line wins, drop nulls.
    Both judges' rows are kept: the dual-judge protocol pools them.
    Also drops hallucinated-refusal rows recorded before judge.py's
    REFUSAL_RE fix existed (measured 61/69 false claims of missing input)."""
    best = {}
    order = []
    for line in jpath.read_text(encoding="utf-8-sig").splitlines():
        if not line.strip():
            continue
        o = json.loads(line)
        if o.get("score") is None:
            continue
        if REFUSAL_RE.search(o.get("reason") or ""):
            continue
        k = (o["judge"], o["model"], o["item_id"], o["sample"])
        if k not in best:
            order.append(k)
        best[k] = o
    return [best[k] for k in order]


def judge_family_map():
    """judge name -> family, and candidate name -> family, from config.
    Used to drop same-family judgments (self-enhancement bias) even for rows
    already on disk from before the judge.py exclusion fix."""
    judges = {j["name"]: j.get("family") for j in CFG["judges"]}
    cands = {c["name"]: c.get("family") for c in CFG["candidates"]}
    return judges, cands


def same_family(o, judge_fam, cand_fam):
    jf = judge_fam.get(o.get("judge"))
    return jf is not None and jf == cand_fam.get(o.get("model"))


def lol_a_scores():
    jpath = ROOT / CFG["paths"]["judgments"] / "lol_a_judgments.jsonl"
    if not jpath.exists():
        return {}, 0
    items = {}
    ipath = ROOT / CFG["paths"]["items_a"]
    if ipath.exists():
        for line in ipath.read_text(encoding="utf-8-sig").splitlines():
            if line.strip():
                o = json.loads(line)
                items[o["id"]] = o["family"]
    judge_fam, cand_fam = judge_family_map()
    enabled = enabled_candidates()
    per_model = {}
    fam = {}
    rows = load_valid_judgments(jpath)
    for o in rows:
        if o.get("model") not in enabled:
            continue
        if o.get("model") == o.get("judge_model"):
            continue
        if same_family(o, judge_fam, cand_fam):
            continue
        s = float(o["score"])
        per_model.setdefault(o["model"], []).append(s)
        f = items.get(o["item_id"], "unknown")
        fam.setdefault(o["model"], {}).setdefault(f, []).append(s)
    out = {}
    for model, scores in per_model.items():
        families = {
            f: {"mean": round(mean(xs), 3), "n": len(xs)}
            for f, xs in sorted(fam.get(model, {}).items())
        }
        out[model] = {
            "mean": round(mean(scores), 4),
            "ci95": bootstrap_ci(scores),
            "n_scored": len(scores),
            "items": 150,
            "samples_per_item": CFG["n_samples"],
            "families": families,
        }
    return out, len(rows)


def judge_validity(jpath):
    """Free judge-validity signal: agreement between the two independent judges
    on the same (model, item, sample) rows. Exact-match rate + Cohen's kappa."""
    if not jpath.exists():
        return {"n_pairs": 0}
    judge_fam, cand_fam = judge_family_map()
    enabled = enabled_candidates()
    by_key = {}
    for o in load_valid_judgments(jpath):
        if o.get("model") not in enabled:
            continue
        if o.get("model") == o.get("judge_model"):
            continue
        if same_family(o, judge_fam, cand_fam):
            continue
        by_key.setdefault((o["model"], o["item_id"], o["sample"]), {})[o["judge"]] = float(o["score"])
    pairs = [v for v in by_key.values() if len(v) == 2]
    if not pairs:
        return {"n_pairs": 0}
    agree = sum(1 for v in pairs if len(set(v.values())) == 1)
    n = len(pairs)
    p_o = agree / n
    # Cohen's kappa over the 3-point scale {0, 0.5, 1}
    labels = (0.0, 0.5, 1.0)
    a = [v["deepseek-judge"] for v in pairs]
    b = [v["qwen-judge"] for v in pairs]
    p_e = sum((a.count(x) / n) * (b.count(x) / n) for x in labels)
    kappa = (p_o - p_e) / (1 - p_e) if p_e < 1 else 1.0
    return {
        "n_pairs": n,
        "agreement": round(p_o, 4),
        "kappa": round(kappa, 4),
    }


def lol_b_placeholder():
    return {
        "status": "voting open at lolbench.lol - per-matchup win rates with Wilson CIs appear as votes accumulate. No Elo until vote volume justifies Bradley-Terry fitting (C5).",
    }


def lol_c_placeholder():
    return {
        "status": "pending data import: graded joke pools (rJokesData/HAHA subsets) with owner curation.",
    }


def build_matchups():
    """Pair each model's wave-0 joke against every other model's joke, per premise.
    Deterministic sample index (0) for fairness; one matchup per pair per premise
    with sides shuffled so A/B position is random."""
    out_dir = ROOT / CFG["paths"]["outputs"]
    enabled = enabled_candidates()
    models = sorted(p.parent.name for p in out_dir.glob("*/lol_b.jsonl") if p.parent.name in enabled)
    if len(models) < 2:
        return []
    by_model = {}
    for m in models:
        for line in (out_dir / m / "lol_b.jsonl").read_text(encoding="utf-8").splitlines():
            if line.strip():
                o = json.loads(line)
                if o.get("sample") == 0 and not o.get("empty"):
                    by_model.setdefault(m, {})[o["item_id"]] = strip_think(o["output"])
    premises = sorted(set().union(*[set(v.keys()) for v in by_model.values()]))
    matchups = []
    for prem in premises:
        present = [m for m in models if prem in by_model.get(m, {})]
        for i in range(len(present)):
            for k in range(i + 1, len(present)):
                a, b = present[i], present[k]
                if random.Random(f"{prem}|{a}|{b}").random() < 0.5:
                    a, b = b, a
                matchups.append({
                    "matchup_id": f"{prem}:{min(a,b)}-vs-{max(a,b)}",
                    "premise_id": prem,
                    "model_a": a,
                    "model_b": b,
                    "a": by_model[a][prem],
                    "b": by_model[b][prem],
                })
    rng = random.Random(7)
    rng.shuffle(matchups)
    return matchups


def spend_by_model():
    """Per-model USD cost, priced at what the model actually costs to run
    (MODEL_PRICES), not what our harness happened to be billed.

    Deliberately ignores outputs/cost_log.jsonl for this figure: it only
    caught a fraction of real calls for some models (e.g. 7 logged calls for
    glm-5.3-flash against ~900 real generations - cost logging clearly
    wasn't active for the whole run), so "has any logged tokens" cannot mean
    "fully accounted for". The only source that's complete for every model
    is the actual output text on disk. Token counts are estimated from that
    text (~4 chars/token, the standard rough approximation; input assumed to
    run a quarter of output length, matching this project's short prompt
    templates against longer explanations/jokes). Every figure returned here
    is an estimate - the return value is a single flat map, and the caller
    should present it as such rather than implying per-call metering."""
    enabled = enabled_candidates()
    spend = {}
    for m in enabled:
        chars = 0
        for rel in (f"outputs/{m}/lol_a.jsonl", f"outputs/{m}/lol_b.jsonl"):
            p = ROOT / rel
            if not p.exists():
                continue
            for line in p.read_text(encoding="utf-8-sig").splitlines():
                if not line.strip():
                    continue
                chars += len(json.loads(line).get("output") or "")
        tout = chars // 4
        tin = tout // 4
        pin, pout = MODEL_PRICES.get(m, (5, 25))
        spend[m] = round(tin / 1e6 * pin + tout / 1e6 * pout, 2)
    return spend, {m: True for m in enabled}


def main():
    jpath = ROOT / CFG["paths"]["judgments"] / "lol_a_judgments.jsonl"
    jv = judge_validity(jpath)
    lol_a, n_valid = lol_a_scores()
    spend, spend_estimated = spend_by_model()
    results = {
        "dataset_version": CFG["dataset_version"],
        "harness_version": CFG["harness_version"],
        "harness_hash": harness_hash(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "banner": "PRELIMINARY - auto-judged, no human calibration yet. Judge model family is disjoint from scored candidates.",
        "counts": {
            "judgments_valid": n_valid,
            "judge_pairs": jv.get("n_pairs", 0),
        },
        "judge_validity": jv,
        "spend": spend,
        "spend_estimated": spend_estimated,
        "lol_a": lol_a,
        "lol_b": {**lol_b_placeholder(), "n_matchups": 0},
        "lol_c": lol_c_placeholder(),
    }
    matchups = build_matchups()
    results["lol_b"]["n_matchups"] = len(matchups)
    (ROOT / "site" / "matchups.json").write_text(json.dumps(matchups, indent=2), encoding="utf-8")
    out = ROOT / CFG["paths"]["site_results"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()

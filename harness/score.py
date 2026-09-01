import hashlib
import json
import random
from datetime import datetime, timezone
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CFG = yaml.safe_load((ROOT / "harness" / "config.yaml").read_text(encoding="utf-8"))


def mean(xs):
    return sum(xs) / len(xs) if xs else 0.0


def bootstrap_ci(xs, iters=1000, seed=42):
    if len(xs) < 2:
        m = mean(xs)
        return [m, m]
    rng = random.Random(seed)
    ms = sorted(mean(rng.choice(xs) for _ in xs) for _ in range(iters))
    return [round(ms[int(0.025 * iters)], 4), round(ms[int(0.975 * iters)], 4)]


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


def lol_a_scores():
    jpath = ROOT / CFG["paths"]["judgments"] / "lol_a_judgments.jsonl"
    if not jpath.exists():
        return {}
    per_model = {}
    for line in jpath.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        o = json.loads(line)
        if o.get("score") is None:
            continue
        per_model.setdefault(o["model"], []).append(float(o["score"]))
    out = {}
    for model, scores in per_model.items():
        out[model] = {
            "mean": round(mean(scores), 4),
            "ci95": bootstrap_ci(scores),
            "n_scored": len(scores),
            "items": 150,
            "samples_per_item": CFG["n_samples"],
        }
    return out


def lol_b_placeholder():
    return {
        "status": "voting open at lolbench.lol - per-matchup win rates with Wilson CIs appear as votes accumulate. No Elo until vote volume justifies Bradley-Terry fitting (C5).",
    }


def lol_c_placeholder():
    return {
        "status": "pending data import: graded joke pools (rJokesData/HAHA subsets) with owner curation.",
    }


def main():
    results = {
        "dataset_version": CFG["dataset_version"],
        "harness_version": CFG["harness_version"],
        "harness_hash": harness_hash(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "banner": "PRELIMINARY - auto-judged, no human calibration yet. Judge model family is disjoint from scored candidates.",
        "lol_a": lol_a_scores(),
        "lol_b": lol_b_placeholder(),
        "lol_c": lol_c_placeholder(),
    }
    out = ROOT / CFG["paths"]["site_results"]
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()

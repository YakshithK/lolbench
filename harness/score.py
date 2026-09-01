import hashlib
import json
import random
import re
from datetime import datetime, timezone
from pathlib import Path

import yaml


def strip_think(text):
    return re.sub(r"<think>.*?</think>", "", text, flags=re.S).strip()

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
    items = {}
    ipath = ROOT / CFG["paths"]["items_a"]
    if ipath.exists():
        for line in ipath.read_text(encoding="utf-8-sig").splitlines():
            if line.strip():
                o = json.loads(line)
                items[o["id"]] = o["family"]
    per_model = {}
    fam = {}
    for line in jpath.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        o = json.loads(line)
        if o.get("score") is None:
            continue
        if o.get("model") == o.get("judge_model"):
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
    return out


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
    models = sorted(p.name for p in out_dir.glob("*/lol_b.jsonl"))
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


def main():
    results = {
        "dataset_version": CFG["dataset_version"],
        "harness_version": CFG["harness_version"],
        "harness_hash": harness_hash(),
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "banner": "PRELIMINARY - auto-judged, no human calibration yet. Judge model family is disjoint from scored candidates.",
        "lol_a": lol_a_scores(),
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

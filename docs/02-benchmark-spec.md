# LOL Bench — Benchmark Spec

## Track A — Appreciation (comprehension; auto-judged, rubric-scored)

### Item families
| # | Family | Task | Scoring |
|---|---|---|---|
| F1 | Mechanism explanation | Explain why a joke is funny | Rubric: essential elements hit / partial |
| F2 | Pun disambiguation | Identify both meanings (SemEval-2017 Task 7 subtask-3 pattern, modernized beyond WordNet sense keys; LLM-judged explanation equivalence) | Element match |
| F3 | Benign-violation localization | What norm is violated, why is it benign | Two-part rubric |
| F4 | Caption explanation | Explain New Yorker/CartoonStock-style caption humor (HumorBench pattern) | Expert essential-elements rubric |
| F5 | Cultural reference | Resolve in-jokes/memes | Element match |
| F6 | Failed humor | Explain why a joke is NOT funny | Rubric; the differentiation wedge — no existing benchmark covers this |

### Sizing
- v0: 150–200 items (agent-drafted, 100% human-curated), 4–6 families.
- C5 target: ~500 items + ~500 private held-out (never published).
- ~246 items ≈ ±5% at 95% CI; per-family CIs computed per model.

## Track B — Production (generation; humans vote)

### Wave-0 (day 1)
- ~40 constrained premises, 1 format (setup → punchline).
- All models generate; anonymous pairwise voting on site; per-matchup win rate + Wilson CIs. NO Elo at this stage.

### Wave-1+ (C6)
- Full matrix: premise x format (one-liner, monologue bit, Oogiri-style punchline slot, fake review, roast-with-guardrails) x persona/audience x edginess budget. Combinatorial, non-memorizable.
- Human anchors enter (licensed, paid, opt-in; comedian tier + crowd tier).
- Aggregation: Swiss tournament → Bradley-Terry MLE Elo with CIs; ~500 bouts/model for ~±10-point stabilization (Arena convergence figure).
- Sub-scores per Oogiri dimensions: Novelty, Clarity, Relevance, Intelligence, Empathy, Funniness. Style-coverage Elo per format/persona.

## Track C — Discrimination (taste; fully automatic)
- Graded pools: curated subsets of rJokesData (550k rated) + HAHA (200k), re-labeled subset (~1,500) to fix crowd-label noise.
- Metric: rank correlation with human gold + funniness-score calibration.
- Self-awareness probe: does a model's LOL-C judgment track its own LOL-B output quality?

## Judge protocol (all tracks)
- >=2 heterogeneous judge models; judge family never scores its own family (self-enhancement bias is documented).
- Persona-randomized voter panels (Crowd Score method); mandatory position-swap and length normalization (position/verbosity bias, MT-Bench taxonomy).
- Human spot-check of 20 judge-graded samples before any publish.
- Judge-validity score (jury vs human agreement) recomputed and published every wave at C6+.

## Inter-annotator agreement (alpha) protocol
- 3 raters (owner + 2 friends), 100 items, independent and blind, Krippendorff's alpha per family.
- Expectation setting from literature: alpha ~0.45 on funniness is NORMAL and is reported as-is.
- Non-blocking for launch; required before PRELIMINARY banner can be dropped from Track B.

## Statistics standards
- n >= 10 samples per model-item at C5+ (n=3–5 documented deviation at v0); mean + bootstrap CI.
- Significance: McNemar (binary), paired t / Wilcoxon (scores), always with effect sizes.
- Day-1 win rates: Wilson CIs. Elo: BT MLE with bootstrap CIs.
- Saturate-guard: top-5 models statistically inseparable for 2 consecutive waves → next wave is made harder by design (Dynamic principle, operationalized).

## Contamination controls
- Canary strings in every item from birth; 10-gram dedup vs web-corpus proxies.
- Private held-out split never published; public-dev vs private-score gap is the leak detector (GSM1k twin method).
- Order-permutation memorization test runnable on open models (Oren et al., ICLR 2024).
- Wave items retire after one wave; waves sourced fresher than any training cutoff.

## Data files (naming makes tracks explicit)
```
data/lol_a_items.jsonl          # Track A curated items (F1-F6)
data/lol_b_wave0_premises.jsonl # Track B wave-0: 40 constrained premises (B's judge is the public vote, not a model)
data/lol_c_pools.jsonl          # Track C graded joke pools with human ratings
data/private/                   # gitignored held-out split
```

## Data schema (every item)
```
id, family, track, text/prompt, constraints{}, gold_elements[], edginess_budget,
canary, provenance{source, license, annotators[]}, status{dev|private|retired},
version_added, version_retired
```

## Harness rules
- Pinned prompts, chat templates, decoding params, judge prompts.
- Every result stamped with (dataset_version, harness_hash) — same weights can swing 10–20 points across harnesses; the stamp makes scores comparable.

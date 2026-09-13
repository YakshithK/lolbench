# LOL Bench — Long-Term Roadmap (post-C7 direction)

## Launch cadence (adopted 2026-09-12)
- **Thursday is launch day, weekly.** Ship one visible thing per launch, harvested
  from the feedback ledger (docs/08-launch-log.md); post, reply-sprint (~2h), log
  feedback, close the loop publicly ("you asked, we built" + tag the requesters).
- Reddit: rotate subs every launch (r/artificial, r/LocalLLaMA, r/MachineLearning,
  r/singularity, niche humor/sci subs), fresh angle each time. Never re-post the
  same link to the same sub; self-promo rules are enforced per-sub.
- HN: Show HN only on genuine overhaul substance, at most every 2-4 weeks (one per
  project is the norm; overhauls qualify, feature bumps do not). Between Show HNs:
  regular submissions (technical deep-dives like the counterfactual finding,
  result writeups) - no repost restriction on those.

## LOL-C probe plan (written 2026-09-13, after the launch-feedback review)

State: 12 probe ballots lifetime (10 on the since-quarantined C-0082), 0 since the
shuffle fix deployed (sample too small to read - ~26% chance of zero in 6 ballots),
site traffic ~6 ballots/day post-spike, cohort question 0/6 takers so far.

Owner concern on record: the probe flow may ask too much of the average visitor.
The vote itself costs nothing extra (identical one-click; probes are invisible
until the reveal). The REVEAL is the load - it makes the voter process methodology
("the Reddit crowd favorite was panel A") where they wanted a punchline.

Plan, in order:
1. Reveal copy tweak (queued, ~10 lines in Sidebar.jsx): make it a game, not a
   lecture - e.g. "the internet picked panel a. You picked panel b. 48% of voters
   match the crowd." Same data lane, zero homework.
2. Checkpoint after TWO posts (Tuesday's kill-test post + one more): read the
   probe rate. Meaningful movement -> keep passive collection as is.
3. If the probe rate is still ~zero after two posts: build the TASTE TEST - a
   dedicated opt-in mode instead of booth-interjected probes. Spec: 10 pairs from
   the reviewed pool, ~2 minutes, one entry point on the leaderboard, ends with a
   shareable result ("you match the internet's taste: 60%"), per-pair reveal of
   the crowd favorite, same kind='c' lane and cohort tagging as booth probes.
   The site GIVES the visitor something instead of asking.
4. Unchanged: the pre-registered branch decision (~600-900 ballots before run_c.py
   means anything; kill criterion if the ceiling can't be measured - a negative
   result ships). The taste test exists to reach that decision with data, not to
   replace it.

## Near-term experiment queue (from launch feedback, priority order)
1. **Familiarity kill-test** (NeuralNomad87): ~50 genuinely obscure real jokes
   through the same explain-and-grade pipeline. **RUN 2026-09-13 - familiarity
   REJECTED; F6's working-vs-failed differential survives the confound
   (results in docs/10 section 10).** Either outcome is publishable. Free pipes.
2. **Formatting normalizer** (Lower-Ad-6293): display-layer only (em dash -> comma,
   !!! -> !, CAPS -> case; keep periods/commas/question marks/line breaks). Applies
   retroactively at render time, no rerun, no migration.
3. **Cohort question** (NeuralNomad87): one optional "how online are you?" in the
   booth, nullable column, per-cohort agreement alongside global. Tests his claim
   that audience-targeting is where models actually differ (our 0.837-0.922
   compression is evidence-shaped like his theory).
4. **Community joke submissions**: a submit box behind the vote booth. Definitionally
   post-cutoff content (contamination-clean by construction); slow volume at current
   traffic but compounds weekly with launch cadence.
5. **F6 corpus expansion**: double the 725-explanation counterfactual corpus and
   control the rubric-priming confound (our F6 rubric feeds judges
   "expectation"/"incongruity" vocabulary) with a variant rubric.

## Theoretical register (for the paper)
- **Counterfactual theory of failed-humor difficulty**: explaining a working joke
  is describing what exists; diagnosing a dud requires constructing the ideal
  version that was never written. Three independent community members converged on
  it (Past_Floor_2405, litocampo23, NeuralNomad87). Our data supports its shape:
  low-scoring F6 explanations say THAT it fails ("doesn't land," 72%) without
  saying WHY. "Timing" is NOT the catch-all (0.3% of bad explanations; 2.7% of
  good ones). Full log: docs/08-launch-log.md.
- **Familiarity confound** (NeuralNomad87): famous jokes ship with commentary in
  training data; obscure and failed jokes don't. The success/failure explanation
  gap may measure recall-vs-reasoning distance. Kill-test queued above.
- **Anti-humor boundary** (community): "so unfunny it's funny" blurs F6's fail
  category; a dud that lands as anti-humor scores as a model miss while succeeding
  sideways. Methods footnote; possible F7 (deliberate anti-humor family).

## Operating rhythm (the steady state)
- Fresh premise waves on a fixed cadence; items retire after one wave.
- Quarterly audits: contamination re-check, item quality review, judge-validity refresh.
- Saturate-guard is permanent: top-5 inseparable two waves → harder next batch (tighter constraints, F6-style failed-humor items, narrower personas).

## The voting flywheel
Public pairwise voting is simultaneously: the viral surface, free evaluation labor, and LOL-B calibration data. Every wave grows the human-vote pool that makes judge-validity and Elo sharper. This loop is the benchmark's compounding asset. The neither/stage-2 upgrade (2026-09-12) deepens it: every "neither" now carries a why and an optional note.

## Track deepening
- **LOL-B:** comedian anchor tier (paid/licensed), style-coverage Elo per format/persona, edginess-budget analysis, empathy-dimension focus (the documented LLM weak spot).
- **LOL-A:** F6 (failed humor) expansion — the least-covered, most scientifically interesting family; harder cultural-reference items; adversarial items written to exploit judge biases; familiarity-controlled obscure-item stratum once the kill-test lands.
- **LOL-C:** self-awareness probe becomes a standalone reported metric; cross-model taste-distance matrix (which models share a sense of humor).

## Expansion axes (gated, in order of expected value)
1. Multilingual (ES/ZH) — MWAHAHA established precedent and participant demand (28 teams).
2. Multimodal caption humor (image/GIF) — MWAHAHA subtask B precedent.
3. Long-form comedy (monologue coherence over multi-turn setups).
4. Community item contributions through the standard rater-agreement bar.

## Instrument maturity markers
- Judge-validity > 0.7 sustained → fine-grained Elo fully defensible.
- Alpha published on every Track B release → PRELIMINARY banner permanently retired.
- Two+ consecutive clean waves → C7 achieved → the benchmark is self-sustaining infrastructure.

## Dissemination (only when the instrument earns it)
- arXiv + HuggingFace release at C5 regardless of outcome, including negative results.
- Community/shared-task engagement where humor-eval people already are (the MWAHAHA/CHum orbit).
- The origin tweet gets the follow-up post: what was built, what was learned, what the numbers honestly say.

## Standing risk register (updated 2026-09-12)
| Risk | Mitigation |
|---|---|
| Judge–human alignment stalls low | Rank bands not Elo; judge-validity published; humans remain the anchor |
| Saturation of LOL-A | F6/harder items by design; saturate-guard rule |
| Vote spam/astroturf | Rate limits, no accounts, honeypots (LOL-C probes live), anomaly flags |
| Free-tier ToS/rate changes | HIT TWICE in week one: bai killed glm-5.3-flash free quota (glm-judge retired, 2-judge floor held); Hack Club per-slug throttles skip-and-rotate. Local Mac Studio judge + open candidates reduce API dependency structurally |
| Provider concentration | Never below 2 live providers for any lane (judges OR candidates); a third judge family is the standing top-up priority |
| Solo-builder bandwidth | Everything agent-scriptable stays scripted; owner time reserved for curation and judgment calls only |

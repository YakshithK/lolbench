# LOL Bench — Governance

## Pre-registered hypotheses and kill criteria
- **H1 (dissociation):** LOL-A (comprehension) does not predict LOL-C (taste) across models. Grounded in the Oogiri finding (human judges weight Empathy, LLM judges weight Novelty).
- **H2 (non-saturation):** LOL-A does not saturate across 5–10 models; >=2 model pairs separable beyond CI. Risk flag: HumorBench found STEM reasoning transfers to humor comprehension — saturation is the default expectation, not the surprise.
- **Kill rules:**
  - H2 fails → LOL-A is not a leaderboard core; keep as diagnostic sub-score or stop Track A.
  - LOL-C ~ perfectly predicted by crowd-upvote regression → no novel signal; drop or reduce to self-awareness probe.
  - v0 envelope blown → stop before any expensive machinery; publish negative/limited result.
- A negative result ships. It is credited to the origin tweet and reported honestly.

## Labeling rules (the moat)
- PRELIMINARY banner: mandatory until alpha + judge-validity are published.
- Every published number ships with: n, CI, harness hash, dataset version.
- Judge-validity score and alpha live on the leaderboard page itself, not an appendix.
- If jury–human agreement < 0.6 at C6: Track B reports rank bands, not point Elo. No exceptions.

## Ethics
- Offense is not harm (DeepMind comedians study): edginess budgets annotated per item; punching-up/down tags; roast-with-guardrails format exists deliberately.
- Human-written anchors: paid, licensed, opt-in. No scraped writer material without consent.
- Free-tier provider data-use disclosed on-site where applicable.
- Voting data: no accounts, no PII collected; aggregated stats only.

## Contamination policy
- Canaries from item birth; 10-gram dedup vs web proxies; private split never published.
- Public-dev vs private-score gap monitored per model = leak detector (GSM1k twin method).
- Order-permutation memorization test on open models per model release (Oren et al.).
- Wave items retire after one wave; premise sourcing stays fresher than any training cutoff.
- Documented per-release: "what we checked, what we found."

## Versioning
- Dataset versions + harness hash stamp every result; breaking changes bump major version.
- Deprecation notes public; changelog public; community item contributions accepted only through the same rater-agreement bar as staff items.

## Scope discipline
- v1: English, text-only. Multilingual (ES/ZH — MWAHAHA precedent) and multimodal (GIF/caption — MWAHAHA subtask B precedent) are follow-ons, not v1.
- Nothing downstream of C5 gets built on hope: every expansion passes a gate with pre-written criteria.

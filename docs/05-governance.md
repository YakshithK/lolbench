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
- **Known limits (community-audited 2026-09-11/12, see docs/08-launch-log.md):**
  - Memorized JOKES (Chris-Hart): sourced old-pool items may be in training data.
    Mitigation: B-premises are fresh-written; detection tests judgment not recall;
    fresh human-written items are the structural fix (roadmap queue).
  - Memorized COMMENTARY (NeuralNomad87): famous jokes ship with analyses in
    training data, so explaining them is partly retrieval. Kill-test queued
    (obscure-joke stratum). Deeper than the joke-level confound and distinct from it.
  - Stale-item freshness (sergey_v): dated-event humor reads factually broken to
    later voters and gets recorded as unfunny. Mitigation:
    harness/freshness_check.py at sourcing time; quarantine at rotation, not
    mid-flight (ballot continuity).
  - Style unblinding (sergey_v): em dashes mark AI text and partially unblind the
    anonymous vote. Mitigation: dash ban in generation prompts (forward-only;
    wave-0 vs wave-1 style delta is a documented footnote).
  - Anti-humor boundary: "so unfunny it's funny" scores as model failure while
    succeeding sideways. Methods footnote until an F7 exists.

## Voting data
- No accounts, no PII collected; aggregated stats only. Cohort question (when it
  ships) is optional, self-reported, coarse, and nullable - and its answers are
  aggregation-only too.
- Neither votes and stage-2 feedback (reason + optional note) are stored distinct
  outcomes. Notes are stored, never scored. Free-text is capped (500 chars) and
  never rendered back to other users.
- Vote-booth integrity: one ballot per (voter hash, matchup) enforced at the DB;
  model standings never read the probe lane and vice versa (kind-tagged lanes).

## Versioning
- Dataset versions + harness hash stamp every result; breaking changes bump major version.
- Deprecation notes public; changelog public; community item contributions accepted only through the same rater-agreement bar as staff items.

## Scope discipline
- v1: English, text-only. Multilingual (ES/ZH — MWAHAHA precedent) and multimodal (GIF/caption — MWAHAHA subtask B precedent) are follow-ons, not v1.
- Nothing downstream of C5 gets built on hope: every expansion passes a gate with pre-written criteria.

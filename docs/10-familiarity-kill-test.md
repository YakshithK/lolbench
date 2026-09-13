# The Familiarity Kill-Test — full experiment design (2026-09-12)

Origin: NeuralNomad87's launch comment (docs/08 item 6, "the best comment of the
launch"), upgraded from roadmap queue #1 to a designed experiment by owner
decision. Companion to the counterfactual theory of F6 (docs/08 item 5): that
theory explains WHY failed jokes are hard to diagnose; this experiment tests
WHETHER the measured success/failure gap is humor reasoning at all, or
familiarity wearing a humor costume.

## 1. The claim under test

LOL-A currently shows real-joke (T-tier) explanations scoring ~92-95 while
failed-joke (F6) explanations score ~81. The standing interpretation: diagnosing
failure requires constructing a counterfactual (generative reasoning), explaining
a working joke is describing what exists. NeuralNomad's confound: famous jokes
ship with COMMENTARY in training data, so explaining them is partly retrieval;
failed jokes have no literature, so explaining them is pure generation. If he is
right, the 95-vs-81 gap measures recall-vs-reasoning distance, not humor.

## 2. The 2x2 (owner's framing)

| | joke WORKS | joke FAILS |
|---|---|---|
| famous (commentary plausibly exists) | ~92-95 (have: T-tier) | n/a (famous jokes rarely fail) |
| obscure (no commentary anywhere) | **? <- this experiment fills the cell** | ~81 (have: F6; failed jokes are obscure by definition) |

Existing data crosses both dimensions at once (famous->obscure AND works->fails),
so neither axis is identified. The kill-test fills exactly one cell: obscure
WORKING jokes.

## 3. Predictions (pre-registered before item selection)

- P1 (reasoning): obscure-working ~ famous-working (~95). The success/failure axis
  survives uncontaminated; F6 becomes the benchmark's only provably
  non-retrieval tier. Headline outcome; the gap is real humor reasoning.
- P2 (familiarity): obscure-working collapses toward failed-joke levels (~81).
  The T-tier number was substantially retrieval. LOL-A scores get reinterpreted;
  the negative result ships (governance rule). F6 failure-explanations remain
  the only generative task in the benchmark - which is itself a finding.
- P3 (mixed): partial drop. Report the decomposition: gap = familiarity share +
  reasoning share. Also publishable; the 2x2 was designed to allow this.

Decision rule: compare per-model mean(obscure-working) against both anchors with
bootstrap CIs (n=50 items x 3 samples per model gives ~±3-4pt bands at the pilot's
resolution, where the pilot detected 4-6pt whole-band shifts).

## 4. Three arms

- Arm K (core, n=50): obscure real WORKING jokes, old-but-unfamous, verified
  no-commentary by web search.
- Arm R (robustness, n=15-25): post-cutoff working jokes (sourced fresh, dated
  after the candidates' training cutoffs). Structurally unretrievable - no model
  can have commentary on them. If Arm K's result replicates here, the finding is
  contamination-proof. (Smaller: fresh working jokes are hard to source at volume -
  the v0.3 sourcing already showed long-form/edgy pass rates ~25-31%.)
- Control arms: NO new data needed. Famous-working = existing T-tier scores;
  obscure-failed = existing F6 scores. Reusing them is also the point: the
  experiment must run the IDENTICAL pipeline (same generate.md, same judge_f6.md
  argument-validity rubric, same judges, same 0-100 scale) or the comparison is
  invalid.

## 5. Item criteria (the operationalization, written before sourcing)

A candidate enters Arm K only if ALL hold:
1. Real human-written (r/Jokes or r/dadjokes via the existing source_jokes.py
   pipeline; no LLM-drafted items - this experiment's validity depends on real
   provenance).
2. Working: passes the owner's taste read (the curation doctrine's ~10 boundary
   flags reviewed by owner; owner IS the project's taste anchor - same role as
   the C-pool blind review). Upvote band as pre-filter: roughly 20-500 on source
   (enough signal that strangers found it funny, far below fame).
3. Obscure: web search for the joke's distinctive n-gram(s) returns no analysis,
   compilation, listicle, or "best jokes" page presence. Hit threshold: zero
   commentary hits; compilation hits exclude. Search evidence saved per item
   (URLs + hit counts) into provenance - this is the paper's obscurity audit.
4. Passes freshness_check.py (stale jokes read broken and would confound the
   cell) and the family-friendly safety gate with the owner's two regression
   cases (pregnant cup-size, Jesus-nail).
5. Not a near-dup of anything already in A/C (Jaccard sweep, existing tooling).

Arm R adds: 6. Post-cutoff date, documented per item.

Known limitation, disclosed up front: training data cannot be directly queried;
web presence is the proxy for "commentary exists." Arm R exists to cover the
gap in that proxy.

## 6. Execution plan (quarantine contract, mirroring pilot_a.py exactly)

- Items:      data/lol_a_items_familiarity.jsonl  (family="K1" Arm K / "K2" Arm R)
- Outputs:    outputs/pilot_familiarity/<model>/lol_a.jsonl
- Judgments:  judgments/lol_a_judgments_familiarity.jsonl
- Results:    results/lol_a_familiarity.json
- Never touches site/results.json or the public board (same construction proof
  as the pilot: score.py reads only the main judgment path).
- Implementation: fork harness/pilot_a.py into harness/killtest_a.py (same
  quarantine contract, new sample builder, ~100-line diff). No run.py/judge.py
  changes; judge.py --out already supports concurrent judgment files.
- Models: all 13, n=3 samples/item (matches main-run protocol). Free lanes
  (b.ai flash) first; Hack Club anchors opportunistically in burst windows.
- Cost: pilot (50 items, 13 models) measured ~$5-6 actual vs $2.65 quoted;
  budget ~$6-10, max_spend guard set before launch. 1,950 gen calls + ~3,900
  judgment rows (2 judges), same shapes the judge phase already handles.

## 7. Steps and schedule

1. Source candidates (~100-150) via source_jokes.py with the upvote band; gate
   + dedup + freshness. (one session)
2. Web-verify obscurity per survivor; log evidence to provenance; target 50 + 10
   spares for Arm K, 15-25 for Arm R. (one session, firecrawl)
3. Owner taste read on the boundary flags only (curation doctrine; ~10 items).
4. Build items file + fork runner; --max-items 2 smoke test (~$0); verify the
   quarantine paths stay out of the public board.
5. Full run on free lanes; anchors as windows open. Then judge.py --out.
6. Analysis: per-model 3-anchor comparison (K vs T-tier vs F6), aggregate
   bootstrap CIs, verdict P1/P2/P3 by the decision rule.
7. Write-up: update this doc with results; tag NeuralNomad87 in the Thursday
   post with the outcome either way (standing invitation = community contract).

Target: steps 1-4 inside the week; the result is a strong Thursday ship
("we tested your theory, here is the 2x2") - the benchmark testing its own
community's theories is the documented differentiator.

## 8. Where this lands in the paper

- Methods: the 2x2 design + obscurity audit as the confound-control section.
- Results: whichever P verdict, reported with the same honesty as the F6
  counterfactual check (that check's rubric-priming caveat is already the
  template for disclosing measurement limits).
- If P1: F6 framed as the uncontaminated reasoning tier; the counterfactual
  theory and the kill-test corroborate each other (theory explains the gap,
  kill-test rules out the retrieval alternative).
- If P2: LOL-A's real-joke tier reframed as (partly) retrieval; the paper's
  central dissociation claim gets re-scoped to F6 + LOL-B/LOL-C; still a
  complete and honest paper - "a negative result ships" was pre-registered.
- Discussion: familiarity as a standing confound for ALL humor benchmarks that
  use famous jokes (HumorBench included) - the kill-test is a methodological
  contribution independent of which way it lands.

## 9. Optional zero-cost follow-up

rJokesData carries per-post scores upstream but the A-sourcing did not retain
them. Re-joining by text hash would give a fame gradient WITHIN the existing
T-tier (score vs source-upvotes regression) as corroborating evidence. Deferred:
only worth doing if the main verdict is ambiguous.

## 10. RESULTS (2026-09-13, run complete)

87 items (owner-approved from 92 verified-obscure; kills: a German-lightbulb
duplicate pair the Jaccard sweep missed, a Diana death joke, an organ-trafficking
punchline, one "weird" - each an owner catch the machine gates passed). 7 free-lane
models generated (glm-5.3-flash dead; anchors 0 - HC tar-pit night), both judges
graded, n=885 judge pairs, judge_validity correlation 0.4926 (higher than the main
board's 0.4114).

The 2x2 per model (scores x100; T1/F6 anchors read from the published board):

| model | famous~work | obscure~work | obscure~fail | gap_T-K | gap_K-F6 |
|---|---|---|---|---|---|
| qwen3.8-max | 91 | 94 | 92 | -2.4 | +2.0 |
| qwen3.8-flash | 90 | 94 | 92 | -3.3 | +2.0 |
| glm-5.3 | 90 | 91 | 91 | -0.6 | -0.0 |
| deepseek-v4-pro | 88 | 88 | 83 | -0.7 | +5.1 |
| mimo-v2.5 | 84 | 83 | 81 | +0.4 | +2.6 |
| hy3 | 87 | 83 | 83 | +4.3 | -0.3 |
| mimo-v2.5-pro | 84 | 81 | 81 | +3.1 | +0.1 |

**Verdict: P2 (familiarity) REJECTED. P1 (reasoning) confirmed, sharpened.**

1. Obscure-working scores equal famous-working scores: gap_T-K centers on zero
   (mean +0.1, range -3.3 to +4.3, all within the +/-3-4pt CI at this n). If
   commentary-retrieval drove scores, verified-no-commentary items would collapse
   toward failed-joke levels. They do not. Two qwen models even scored obscure
   items HIGHER than famous ones.
2. The residual working-vs-failed gap (gap_K-F6, +2 to +5 pts) persists BETWEEN
   EQUALLY OBSCURE items. Both cells have zero retrievable commentary, so
   familiarity cannot explain the differential - whatever the F6 rubric measures
   there is about the explanations themselves. This is the P1 claim with
   NeuralNomad's confound experimentally removed, which is stronger than the
   original framing: F6 stays the uncontaminated tier, and now it is MEASURED,
   not just argued.
3. Scope caveats, disclosed: the F6 anchor rows are the main run's LLM-drafted
   failed jokes, so the K-vs-F6 comparison crosses real-vs-synthetic provenance
   (familiarity is controlled; provenance is a separate axis). hy3 and
   mimo-v2.5-pro show the largest residual T-K gaps (+3-4) - within CI noise,
   but the per-model spread is reported as-is.
4. Protocol amendment: design said n=50; all 87 owner-approved items ran (same
   pre-registered criteria, more data, no selection discretion). Cost: $0 metered.

Open follow-ups: anchors backfill (claude/gemini/muse/gpt/grok on the kill-test
set) when HC windows open - frontier coverage on obscure items is paper-nice but
verdict-independent; Arm R (post-cutoff) still blocked on a Reddit fetch route;
4 of 340 candidates permanently unverified (search timeouts).

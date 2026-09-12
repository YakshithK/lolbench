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

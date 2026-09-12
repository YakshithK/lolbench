# LOL Bench — Launch Log & Community Feedback (v0.3, 2026-09-11/12)

First public launch: Show HN + r/artificial + r/ArtificialInteligence (+ X quote-tweet
of the origin thread). ~130 ballots, ~12 substantive commenters across venues, two
drive-by jokes. This file is the permanent record of what the crowd told us and what
we did about it. Source of truth for "you asked, we built" posts and for the paper's
community-feedback section.

## Ballot state at log time
- 124 ballots, 14 matchups with data, first 2 "neither" votes landed within hours
  of the neither-button deploy (B-W0-016).
- Top matchup B-W0-012 sits at a perfect 11-11-11 split (wins_a/wins_b/ties).
- Tie-rate on top matchups ran 35-50% BEFORE the neither button existed: voters were
  using "tie" as the only available "neither." Behavioral confirmation of the
  survey-design complaint below.

## Feedback ledger (every substantive comment, what it means, what we did)

### 1. The "neither" problem — OriginalHospital (r/AI) + sergey_v (HN) + voter behavior
Said: split "I don't get it" from "I get it, not funny"; a forced preference counts
as evidence the winner was good; add a "neither made me laugh" option / slider.
Data: our own tie-rate (35-50%) said the same thing before the humans did.
Done: neither is a distinct stored outcome (vote.js, schema, ballot UI). Stage-2
follow-up on a neither: didn't-get / not-funny / both-terrible + optional 500-char
note (vote_feedback table, /api/feedback). Old tie rows stay ties (can't retro-split);
pre/post-neither tie-rates are not strictly comparable (documented in schema.sql).

### 2. Em dashes as an LLM tell — sergey_v (HN)
Said: "The em dashes in every joke already set the 'another LLM slop' mood."
Implication: dash-heavy generation partially unblinds the anonymous vote (voters
may recognize "AI wrote this" and vote differently).
Done: generation prompt bans em dashes and double hyphens (harness/prompts/generate.md).
Wave-0 rows stay as generated (consistent history; every model had the same prompt).
Known confound: wave-1 vs wave-0 comparisons carry a style delta. Footnote, not blocker.

### 3. Stale-item freshness — sergey_v (HN), the Superbowl specimen
Said: a joke treating a 2020 event as current reads broken to a 2026 voter, and that
staleness gets recorded as unfunny - a different failure mode contaminating humor data.
Done: harness/freshness_check.py (year regex + future-talk + event vocabulary). First
scan: 9/130 C-pool, 1/30 live probes flagged - and the live flag IS his specimen
(C-0082, triple-flagged). SHIPPED 2026-09-12: C-0082 quarantined from the rotation
(replaced by C-0095; still 30 probes, pool-verified clean). Its 10 ballots stay in
the probe lane (never touches standings) but are excluded from the C human-ceiling
analysis. Root cause of the 10/12 pile-up found and fixed: the deterministic probe
"shuffle" in boot.js never moved element 0, so the first file entry was served to
every visitor, every visit. Both shuffles (bouts + probes) replaced with a true
Fisher-Yates - first bout and probe order now vary per visit.

### 4. Contamination (memorized jokes) — Chris-Hart_232 (r/AI)
Said: sourced old jokes may be in training data; models may be remembering, not judging.
Our answer (public + honest): wave-0 B-premises are freshly written (never online);
LOL-A detection tests judgment rather than recall - but the real fix is fresh
human-written items (see roadmap). This is a standing attack; the answer is documented
wherever we publish.

### 5. Counterfactual theory of F6 difficulty — Past_Floor_2405 (r/AI), litocampo23 (r/AI), NeuralNomad87 (r/AI)
Three independent commenters converged on the same theory: explaining a working joke
is describing what exists (retrieval-ish); diagnosing a dud requires constructing the
ideal version that was never written (generative counterfactual reasoning).
Past_Floor's specific testable guess ("models default to 'the timing is off'") was
CHECKED against data: 0.3% of low-scoring candidate explanations say "timing"
(and 2.7% of high-scoring ones - the word is if anything a marker of GOOD explanations).
The real signature: low-scoring explanations say THAT it fails ("doesn't land" in
72%) without saying WHY - exactly what you'd produce if you couldn't build the
counterfactual. Caveat noted: our own F6 rubric primes "expectation"/"incongruity"
vocab, partially confounding the word-frequency read; "doesn't land" is not in our
prompt, so that signal is clean.
Status: strongest research finding of the launch. Goes in the paper as the
theoretical frame for F6; candidate-side corpus = 725 explanations and growing.

### 6. Familiarity confound — NeuralNomad87 (r/AI), the best comment of the launch
Said: the 95-vs-81 (success vs failure explanation) gap may not measure humor at all.
Real famous jokes ship with COMMENTARY in training data (every well-known joke has
been analyzed somewhere), so explaining them is partly retrieval. Failed jokes have
no literature: explaining failure is pure generation. The gap may measure
recall-vs-reasoning distance wearing a humor costume.
His kill-test (free): run genuinely obscure real jokes (no plausible commentary
anywhere) through the same pipeline. If the 95 collapses toward the failed-joke
number, the axis is familiarity, not success/failure.
Status: QUEUED as wave-1.5 experiment (~50 obscure items, gen + judge, free pipes
when throttle windows allow). Either outcome strengthens the paper: if confirmed,
F6 becomes the only uncontaminated tier ("everything else was retrieval; this tier
is the actual reasoning test").

### 7. Formatting crutches — Lower-Ad-6293 (r/AI)
Said: models lean on exclamation marks and em dashes to signal "punchline happened";
strip formatting/punctuation before the ballot so content competes with content.
Planned: display-layer normalizer, render-time only (applies to past matchups, no
rerun): em dash -> comma, !!! -> !, ALL CAPS -> normal. Keep periods, commas,
question marks, line breaks (punctuation can BE the timing; over-stripping damages
jokes). ~20 lines in the ballot render path.
SHIPPED 2026-09-12 (boot.js normalizeJoke, display layer only; stored rows stay as
generated): em dashes/-- -> commas, !!!/?? -> single, ALL-CAPS runs -> normal case.
Initialisms protected by a corpus-derived list (ETA, GPS, PIN, GPA, CEO, FBI, RSVP,
USSR, TIL, LOL, ...) plus the consonant-only catch-all; multi-word runs downcase
together ("NO WAY" -> "No Way", never "NO Way"). Applies identically to probe jokes.

### 8. Cohort agreement — NeuralNomad87 (r/AI)
Said: global preference averages wash out what makes humor interesting; the same
joke splits hard by age/region/how-online; per-cohort agreement is a better signal
and reveals models that are funny to one group and unfunny to everyone else -
"probably the thing that actually varies between them."
Supporting evidence from our own board: 13 models compressed into 0.837-0.922
globally - exactly what you'd expect if real variance lives across audiences.
Planned: one optional cohort question in the booth ("how online are you?" - fits
the site's voice, dodges age/region privacy friction), one nullable column,
per-cohort agreement alongside global. Forward-only.
SHIPPED 2026-09-12 (collection layer): optional booth question with three
self-selected picks (very / somewhat / rarely online), one-time pick remembered in
the voter's browser, stored as nullable votes.cohort (check-constrained, applied
via Management API; schema.sql block). Rides with every ballot, probe lane
included. Per-cohort agreement display deliberately deferred until any cohort
clears the board's n>=10 floor - with 134 ballots any split is statistically
empty.

### 9. Anti-humor edge case — AffectionateGas9544 (OP, in-thread)
Raised: a joke can be so unfunny it becomes funny ("sometimes the unfunniness makes
it funny"). F6's fail category blurs at the anti-humor boundary: a dud that voters
find funny-for-being-bad scores as a model miss when the joke is succeeding sideways.
Status: known F6 limitation, footnote for the methods writeup. No fix short of an
anti-humor family (F7 candidate, see roadmap).

### 10. Jokes and engagement (no action, logged for voice)
- "tertiary shame" (escalating secondhand embarrassment) - the crowd playing the
  game back. Good sign: first instinct was to compete comedically.
- "if AI takes my coding job I should become a standup comedian" (crummy).
- "fortune cookie punchlines" (LowMixture1084) - now free copy for future posts.
- "the timing feels like a sneeze that never comes" (sneeze commenter) - best
  one-line description of F6 anyone has given; going in the writeup.
- "waiting for the machines to understand why a pun doesn't land" (Prestigious-Rock).
- "once your benchmark has to calculate Elo for dad jokes delivered ironically,
  throw away the loss function" (Lower-Ad-6293) - the thread's heckler-comedian.
- One sarcastic drive-by ("exactly what I needed in my day") - correctly ignored.
  Ratio: ~10 substantive to 1 drive-by = reaching outside the friendly bubble.

## Launch operations (what worked, keep doing)
- Reply sprint within hours; quote commenters back; end replies with the ballot link.
- Commenters who make testable predictions get same-day checks (the timing check
  and the freshness catch both came from this). This is the differentiator: the
  benchmark can TEST its community's theories on its own data.
- Two commenters now have standing invitations to see their suggestions run
  (NeuralNomad's kill-test, Lower-Ad's normalizer). Converts commenters into regulars.
- Weekly Thursday launch cadence adopted. Reddit: rotate subs, new angle each time
  (self-promo rules are enforced per-sub). HN: Show HN at most every 2-4 weeks and
  only on genuine overhaul substance; in-between HN presence = regular submissions
  (technical deep-dives, result writeups), which have no repost restriction.

## Provider lessons (2026-09-11/12, logged for the operating record)
- Hack Club: no payment rail; throttling is per-slug and account-level, stacked.
  Burst windows after reset let qwen-max (+294), mimo-pro (+350+313 total), gpt (+82)
  through, then per-slug shutters (muse 6/371, gpt stalled at 251, gemini 0).
  Grind-retries CAN claw through (qwen: 200 -> 819 yesterday) but at terrible
  retry economics; skip-and-rotate beats grind.
- OpenRouter paid burst: $0.42 metered (mimo-pro 855 rows + grok 345) finished two
  models' bulk. Measured ~$0.0005/row at our token shapes - 2x the naive estimate.
  Wallet drained; 402s = hard stop (prepaid safety worked).
- b.ai: glm-5.3-flash free quota hit 0 across ALL THREE keys (balance=0) on
  2026-09-12; glm-5.3 full answers 429 only. glm-judge retired (history preserved,
  same pattern as deepseek-judge). qwen+hy judges remain = 2-judge floor holds for
  every pending model (all non-qwen/non-tencent family). Historical qwen-family
  coverage intact: hy 2,457 + glm 2,457. A 3rd judge from any non-qwen family
  restores full redundancy next launch.
- xAI direct: grok's 370 rows generated on owner credits before wallet emptied;
  routing reverted to Hack Club (free when open).

## Where the board stood at log close
13 models published, dataset 0.3.0, judge_validity n=18,774 (correlation 0.4114,
mean_abs_distance 9.8 pts, exact_match 6.35%). Leaders: claude-opus-5 0.922 (thin
data, wide CI - coasting on F-rows/pilot, no T-rows yet), qwen3.8-max 0.917,
grok-4.6 0.906. Trailer: mimo twins 0.837. Generation parked: claude/gemini T-rows
(0/371 each), gpt remainder (251/371), muse (6/371), grok T3 tail (348/371).

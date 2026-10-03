# Round 2: the kill-test goes public and gets attacked (2026-09-26 to 09-28)

The kill-test had been run in private and written up in `docs/10`. Round 2 is what
happened when it went in front of people who could check it: a post, two subs, 12
comments, and five objections. Three of them were correct. This doc records them,
what was fixed, and what is still open.

Headline numbers to quote (verified against `site/results.json`, board generated
2026-09-29T00:39Z):

- 13 models on the board, dataset 0.3.0, harness 0.1.4
- **26,662** valid judgments, **19,658** double-judged pairs
- judge agreement r=0.4089, mean absolute distance 9.8 pts (published, not hidden)
- total metered+estimated spend **$3.31**
- **12 of 13 models score lower on failed jokes (F6) than on their best real-joke
  tier.** That is the dissociation, and it is the thing to lead with.
- best on board: qwen3.8-max 0.9167 ci[0.913, 0.920] (n=2,376)
- worst: mimo-v2.5 0.8365 ci[0.831, 0.842] (n=3,564)
- 396 items: T1 276, T2 80, T3 15, F6 25
- human ballots: 205 total (184 matchup, 21 probe)

## What the post claimed, and what got pushed back on

The post said the failed-joke tier was "measured, not just argued" and
"uncontaminated". Four people independently attacked the word *uncontaminated*.
They were right. The kill-test controlled for one axis (fame) and left two others
open, and the human booth had never seen the obscure set at all.

### The five objections, and where each one landed

| # | Objection | From | Verdict | Fix |
|---|---|---|---|---|
| 1 | Judges are models too; if commentary exists anywhere the graders saw it too | NeuralNomad87 | Correct | k-lane human panel |
| 2 | The human booth never saw the obscure set | NeuralNomad87 | Correct | k-lane human panel |
| 3 | Obscure jokes can still be structurally familiar; pattern matching, not recall | TheRealBejeezus (x2), rukh999, ofcourseivereddit | Correct, unanswered | Arm R (post-cutoff items) |
| 4 | Working jokes may just be structurally simpler to explain | EzoLabsInc (r/artificial) | Correct, unanswered | Arm R |
| 5 | Were the 87 actually funny, or just obscure? "Working" was a 20-500 upvote band | EzoLabsInc (r/AI) | Correct | k-lane human panel |

Three of five close with one build. Two close only with post-cutoff items, which
is the experiment the audience has to source for us.

Also raised: train a generator on the vote data (Tight-Instruction-17, 3,108
matchups with a human pick each is a real preference dataset, roadmap only), and
"the main page is truly unreadable slop" (Exact-Depth_896).

## What shipped

Round 2 produced six commits of fixes, several of which were bugs in the public
record rather than opinions about it.

- **`/kill-test` page** (`947f6d0`, reframed `b91cec3`). First writeup lived on its
  own URL instead of a docs file, in the house design system. Headline was
  "Someone tried to break this benchmark", which the owner correctly identified as
  reading like a security incident; now "Is it memory, or is it reasoning?".
- **Track 2 shows win rates, not joke volume** (`eb26842`). It was plotting how many
  jokes each model had written, which is a volume metric that rewards padding and
  does not answer "can it land one". Now: decisive-ballot win rate per model with
  95% Wilson intervals drawn as orange whiskers, computed live in
  `/api/leaderboard` so it stays fresh as ballots land rather than needing a
  re-score.
- **parked vs retired separated** (`ff53104`). Parking muse for generation was
  silently deleting a published model from the public board, because `score.py`
  filtered the board by the same `enabled` flag that gates generation. Fixed:
  `enabled` gates generation, explicit `retired: true` is the only opt-out.
- **heatmap renders only real families** (`b9d22c1`). It hardcoded six columns
  F1-F6; F1-F5 have held zero items since v0.3, so five of six columns were empty
  gray wells and the caption wrote a paragraph about families that do not exist.
  Columns now derive from the data: T1, T2, T3, F6.
- **landing page audited against live data** (`2c69a9a`). Three claims were wrong:
  "95%+" came from the retired F1-F5 tiers (current real-joke ceiling is 92.6),
  "jokes in the set: 150" was really 396, and "written and checked by hand" was
  false of the whole set since F6 is model-drafted. The lede is now computed from
  the data rather than asserted, so it cannot drift again.
- **k-lane human panel** (`0260b59`) and **Arm R intake** (`9cadf1a`). Details below.

## The correction that mattered most

claude-opus-5 stopped leading the board. It had been ranked #1 at 0.922 on the
strength of 75 F6-only judgments, a number the board itself flagged as too thin to
rank. When its 552 real T-rows landed it fell to 0.9002 (n=817), sixth place, and
qwen3.8-max took the lead at 0.9167.

This is the thin-data caveat paying out exactly as documented, in public, on the
model everyone wanted to cite as the frontier anchor. Worth stating plainly rather
than burying: the correction costs a flattering headline and buys the credibility
that makes every other number on the page believable.

A separate self-inflicted one: the win-rate table I quoted in conversation had
bugs in the denominator (it counted ties and "neither" as decisions). Corrected
figures are 114 decisive ballots, and only 4 of 13 models clear 20 decisions, so
track 2 is honest but thin. The ranges overlap; it is not a ranking yet.

## The two new lanes

Both are opt-in, both are live, both are at zero.

**k-lane, `/kill-test` + the vote page.** One obscure joke, three answers: it
lands / not funny / broken. "Broken" is deliberately separate from "not funny",
because the question is whether these items are real jokes at all and collapsing
the two would hide the answer inside the question. It reuses the existing winner
vocabulary so it needs no schema migration. Verifies the 87 against humans (closes
1, 2, 5) and doubles as intake filter for anything Arm R collects.

**Arm R intake.** Joke plus a **mandatory dated source link**. The link is the
admission ticket, not a citation: Arm R's entire claim is that an item postdates
training cutoffs, and a self-reported date from a stranger is unfalsifiable while
a link carries a visible timestamp. Three more gates follow: link date post-cutoff,
original date rather than repost date, and not already in the corpus.

Stored `created_at` is when the submitter found it, never the joke's true date;
real dates get established in the audit pass and live in harness output.

## Why both lanes are at zero, stated plainly

Live and verified end to end (k-lane write confirmed against Supabase, submission
insert and 409-on-duplicate both confirmed, probe rows cleaned). Zero
submissions, zero k-lane votes, roughly a day after shipping.

The pattern is already known: the optional note field on the booth has 0 uses
across 15 rows. This audience does not use optional features. That is why both
panels are opt-in and never injected into the rotation, and it is also why
neither metric moves on its own. Optional features protect visitors; they do not
recruit them. Both lanes need a post that asks directly, and NeuralNomad87 has
already said "will do" without a single vote landing.

## Compute: the fourth death wave

Every free lane is gone, verified by direct probe (`docs/04` has the table):

- Hack Club: proxy is OpenRouter-backed, all slugs 402 `Insufficient credits`
  (`limit_source: openrouter_credits`); live slugs return 400 `not a valid model ID`
- b.ai: three keys, all `balance=0`
- kiraai.vn: 404 on free slugs, 402 on an empty wallet
- OpenRouter: key expired (401)
- xAI direct: 403 team credits exhausted
- tokenrouter: 200 on `/models`, 403 `insufficient_user_quota` on every chat,
  including the one model tagged `:free`
- explabs: 288 models listed, every chat `model_requires_purchase`

The 2026-09-17 "stacking" was read as throttling. It was the credit pool draining.
The last free compute was that night.

By 09-25 the first free window reopened and the backlog cleared: a 879-verdict
judge sweep with zero 429s (the first uninterrupted sweep since the 17th), and
generation finished for claude-opus-5 (419) and grok-4.6 (421). Only
muse-spark-1.2 is still parked at 184 rows. Judge validity moved to r=0.4089 on
19,658 pairs.

## What is still open

1. **Objections 3 and 4** (structure, difficulty). Only post-cutoff items fix
   these. Conceded in public, not argued away.
2. **The absurdist stratum does not exist.** Raised by TheRealBejeezus in one
   line: "How many manatees does it take to screw in a light bulb? The potato!"
   is a joke with no explanation to find, which breaks the benchmark's core
   assumption that a joke has a findable mechanism. No absurdist items exist in
   the dataset at all. If models confidently explain nonsense, that is strong
   evidence of pattern matching. Nobody knows, because nobody has measured it.
3. **No human calibration of the judges anywhere on the board.** This is the
   largest methodological gap and it is not specific to the kill-test: r=0.41
   between two judges from different labs is published, and neither has ever been
   checked against a human on the explanation task.
4. **Track B and C.** B has 3,108 matchups and 205 ballots, no Elo (pre-registered
   gate is 600-900). C has never started; the homepage still advertises taste with
   a "no data yet" box.
5. **Paper vs product.** Owner decision, 2026-09-27: product first, paper later.
   Arm R is the only remaining item that serves the paper rather than the product.
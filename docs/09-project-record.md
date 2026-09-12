# LOL Bench — Complete Project Record (v0.3, through 2026-09-12)

The full history of everything that was decided, discussed, built, broken, fixed,
launched, and learned — compiled from the complete build-session chat logs
(Aug 31 to Sep 12, ~1,200 messages across opencode + the migrated session),
every doc, and the 50-commit git history. Written as the permanent memory of the
project: if every other doc burned, this file alone would tell you what happened
and why. Sources: `git log`, `docs/01-08`, the session transcripts, and the
numbers as they were measured at the time (some later superseded; noted inline).

---

## 1. Origin and naming

- Someone building an open-code platform tweeted they were "looking to fund
  someone making LLMs funny." A quote-tweet asked "Who's building LOL bench?"
  Owner replied "Give me a few hours." The response: "Get this guy a job stat."
  That exchange is the entire launch distribution and the reason the project
  exists. (docs/01-vision.md:4)
- **Name debate, resolved in one exchange:** the plan was briefly "ROFLBench"
  (domain hunting found roflbench.lol at ~C$2/yr). Owner overrode it: the
  callback to the tweet requires the exact name LOL Bench. Agent verdict agreed
  and locked it: `lolbench.lol` is the only TLD where the domain itself is the
  joke ("lol bench dot lol"); every alternative (.monster/.cyou/.shop/.sbs)
  "reads like a phishing site." Name verified free on GitHub, PyPI, and npm the
  same night. (session 2026-09-01 01:38)
- The "few hours" promise became the brand pressure: agent set the honest
  framing "live within 24-48h" rather than overclaiming; site shipped same day
  with a PRELIMINARY banner and "scores populating."

## 2. Research phase (Aug 31, before any code)

Grounded with Firecrawl against live sources; every number below was verified
the night it was used:

- **Benchmark anatomy** (Google eval framework arXiv 2506.13023): Datasets →
  Metrics → Methodology; the "5 D's" (Defined, Demonstrative, Diverse,
  Decontaminated, Dynamic); ~246 items = ±5% at 95% CI; harness variance can
  swing identical weights 10-20 points, which is why (dataset_version,
  harness_hash) stamping is load-bearing.
- **Contamination controls**: GSM1k twin-set method (up to 13% drops), canary
  strings, order-permutation tests (Oren et al.), private held-out splits,
  rotating waves.
- **Judge landscape**: MT-Bench GPT-4 judge ~80-85% human agreement; known
  biases = position, verbosity, self-enhancement, style. Chatbot Arena's 2M-vote
  pairwise method is the gold standard for subjective quality.
- **Humor-specific artifacts**: SemEval-2017 Task 7 (129 citations, the 9-year
  category ceiling), rJokesData (550k rated Reddit jokes), HAHA (200k),
  HumorBench (Jul 2025, 8 citations despite Bob Mankoff), the Oogiri 6-dimension
  study (humans weight Empathy, LLM judges weight Novelty; human inter-annotator
  alpha ~0.45 on funniness), DeepMind's comedians study ("cruise ship comedy
  from the 1950s"; offense is not harm), HumorRank (Swiss + Bradley-Terry),
  SemEval-2026 Task 1 MWAHAHA (28 teams — first-ever SemEval humor shared task).
- **The honest re-read the owner forced** ("does this change the plan? be
  brutally honest"): agent's initial "community is converging, timing is good"
  framing was called out as motivated reasoning. Corrected conclusions:
  academic demand is structurally weak (no model card lists humor; citations
  lag), but shared-task participation and live leaderboards (humorbench.com)
  prove demand is community-shaped and entertainment-shaped, not decision-shaped.
  Consequences adopted: sequencing flips to cheap automatable tracks first; kill
  criteria get written down BEFORE data; differentiation must answer "what do
  HumorBench/MWAHAHA/HumorRank NOT cover" (answer: failed-joke explanation F6,
  the taste track, published judge-validity); success metric = community track +
  public leaderboard, not citations.
- **Venue check** (owner: "can i submit anywhere?"): CHum 2027 as the primary
  target, TMLR as rolling fallback, arXiv+HF as the always-do, NeurIPS D&E 2027
  as the stretch. Honest note recorded: "no venue takes a plan — you need a v0
  with real numbers first."

## 3. The design that got locked (and why)

- **Three faculties, three methods** (the thesis): comprehension is convergent
  → rubric scoring (LOL-A); production is divergent, humans agree only ~45-52%
  → pairwise human voting, never a model judge (LOL-B); taste is correlational
  and uncovered → LOL-C. Measuring the dissociation IS the scientific product.
- **Pre-registered hypotheses with kill criteria** (docs/05): H1 = LOL-A does
  not predict LOL-C (Oogiri grounding); H2 = LOL-A does not saturate
  (saturation flagged as the DEFAULT expectation). Kill rules: H2 fails → Track
  A demoted to diagnostic; C is crowd-regression → drop; envelope blown → stop
  and publish the negative result. "A negative result ships."
- **Credibility-first positioning**: PRELIMINARY banner as the moat, error bars
  on the page, judge-validity on the leaderboard not in an appendix, gates
  protect CLAIMS not visibility. This came directly from the research finding
  that judge mistrust (not topic disinterest) killed prior humor benchmarks.
- **De-scoping fight (owner's win)**: agent's first plan had GitHub org, CI,
  datasheets, HF org, versioning machinery. Owner: "a lot of these things are
  institutional... less friction, high quality." Agent audited itself
  ("enterprise cosplay") and cut: personal repo, no CI (the benchmark reruns via
  three commands), provenance as a JSON field, one VERSION string. Kept as
  load-bearing despite looking institutional: pinned prompts (they ARE the
  benchmark), hash stamping, Wilson CIs (20 lines), private split (a gitignored
  folder), canary (one constant).
- **Day-1 metric honesty**: Bradley-Terry Elo needs ~hundreds of bouts; day-1
  ships per-matchup win rates + Wilson CIs. Elo arrives only at C5 volume.
- **Free-tier reality check**: Gemini free (~10 RPM/250/day) cannot carry a
  run; Groq/Cerebras are the bulk lanes; OpenAI/Anthropic have no free tier.
  "Rate limits are the constraint, never money."
- **Owner hardware roles**: Mac Studio M4 Ultra 64GB = free open-model pool +
  potential private judge (zero rate limits, removes self-judging risk); RTX
  5060 8GB = dev/debug only. (Never became load-bearing: free API tiers covered
  everything; local runner never built.)
- **Human spot-check rule**: 20 eyeballed judge-graded samples before anything
  publishes — "a mis-scoring judge on day 1 = credibility death." Later grew
  into the 100-item spot-check tool.

## 4. Build history, day by day

### Aug 31 night → Sep 1: scaffold to live site in hours
- Subagent item-drafting failed twice ("completed" with no files); agent wrote
  all 150 LOL-A items (25 per family F1-F6) + 40 B-premises itself. First of
  many "verify the artifact, not the exit code" lessons.
- Repo pushed to github.com/YakshithK/lolbench. Harness built: run.py
  (checkpointed queue runner), judge.py, score.py (bootstrap CIs, hash
  stamping, matchup builder).
- One heavy bash call hung the session mid-F2; recovered by writing family
  files in parts. Lesson: chunk large writes.
- Supabase project created via Management API; Vercel deploy hit the SSO wall
  (Deployment Protection) — owner disabled it in the dashboard. www subdomain
  never attached → the "404" scare; fixed by aliasing www.
- **The BOM bug**: PowerShell 5.1 `Set-Content -Encoding UTF8` wrote a BOM, so
  625 calls 401'd with a mangled key variable. Root cause of the first "why is
  everything failing" night. .env handling rewritten.
- **The reasoning-token lesson (first of three)**: glm-5.3-flash burns tokens
  on hidden reasoning and returns `content: ""`; token budgets doubled, retry
  logic added. DeepSeek judge, by contrast, "judges perfectly — clean JSON."

### Sep 1: the model-board and money negotiations
- Provider decisions, owner-driven: B.AI = free models ONLY (glm-5.3-flash,
  deepseek-v4-flash, hy3, mimo-v2.5, qwen3.8-flash); OpenRouter = everything
  paid; xAI credits = grok. TokenRouter rejected ("kinda ass, too much rate
  limiting"). Llama-3.3 rejected ("Meta's new ones are Muse" — agent initially
  couldn't find Muse, owner was right: Muse Spark 1.1/1.2, Meta Superintelligence
  Labs, April 2026; agent corrected itself on the record).
- Haiku rejected as "lower-class, not frontier, not worth it." Frontier-anchor
  concept born: n=1 sampling (`anchor: true`) so frontier names appear without
  frontier prices. terra-pro → sol-pro swap saved $0.10 (owner's suggestion).
- Board settled at 15 models / ~$6.83: 5 free flash, 5 OSS flagship, 5 anchors
  (sol-pro, gemini-3.1-pro, opus-5, muse-contributor $0.03, grok-4.6 credits).
- **The curation-rerun correction**: agent claimed post-curation rerun doubles
  cost; owner's confusion exposed the error — curation changes gold answers,
  not questions, so only free judging reruns. "Total project cost just got
  cut in half."
- **The $14 lesson (reasoning tokens, financial edition)**: overnight run burned
  $10.94 of $14 — Tier 2 reasoning models consumed ~2.5x the estimated output
  tokens. Agent's on-record correction: "I priced their outputs like flash
  models. That's the whole discrepancy." Permanent fixes: per-call cost logging
  (outputs/cost_log.jsonl), hard `max_spend_usd` guard, `think: false`
  (OpenRouter reasoning param) on anchors — 4x cost cut. Opus think-on = $7.50
  vs think-off $1.81.
- Owner caught the duplicate-XAI-key .env bug (empty placeholder line + real
  key → nondeterministic extraction; Python `setdefault` would have loaded the
  empty one). .env rewritten last-wins, newline-terminated.
- **The Gemini 400 saga** (a masterclass in not trusting diagnoses): 28/40
  B-premises failed. Agent said "safety filter." Owner pushed back across
  three runs (12→27→38/40 with no code change). Truth: transient backend
  routing/load, plus an initial `think:false` param Google rejects. The
  "70% refusal = the finding" idea was retracted; the 2 remaining refusals
  kept as a footnote. Agent's on-record admission: "I was wrong to confidently
  say 'safety filters' without reading the error body."
- Hack Club AI added as provider (free for students; OpenAI-compatible proxy
  to OpenRouter). Muse contributor tier blocked by OR privacy guardrails →
  full `meta/muse-spark-1.2` via Hack Club works. Muse finished 150/40.
- 15/15 generation complete (accepted gaps: mimo 414/450, qwen-flash 447/450,
  gemini B 38/40).

### Sep 1-2: the UI wars (three rebuilds)
- Rebuild 1: agent's dark "scoreboard" aesthetic. Owner: tabs dead, dots never
  populate, "why are we showing total spend?", "humor-per-dollar — what is it
  supposed to be?", leaderboard blank. Root causes found: missing tab wiring,
  one boot() throw cascading to every panel.
- Rebuild 2: per the owner-authored design system v1 (white canvas, deadpan
  instrument, Libre Franklin/Spline Sans Mono/Newsreader, laugh-yellow +
  red uncertainty whiskers, "no em dashes ever," exactly one 😂 in 3 slots,
  forbidden list incl. Space Grotesk/gradients/box-shadows). Owner authored
  docs/07 + mockups/e-instrument.html themselves; agent implemented.
- **The jargon purge** (owner: "what do anchors mean? F1 F2? this is insane,
  don't explain it to me, just fix it"): F-codes hidden, "F6 · failed humor"
  → "Spotting bad jokes," ANCHOR badge → "n=1," tabs became plain-English
  questions ("LOL-A · Do they get the joke?"), red band explained in the
  foot, n>=10 display floor (owner: "if qwen was 3/3 just remove it") —
  encoded the spec's own rule instead of a hack. Wilson CI floor added so
  3/3 renders as a wide band, never "100 ± 0".
- Benchmark-site grammar researched (LMArena: rank/model/score±CI/votes;
  LiveBench: cost beside score): stat strip = Models/Bouts/Ballots; spend
  column kept per design law §9.5, total-spend stat and scatter killed per
  owner.
- Rebuild 3 (Sep 3, from the migrated session): owner judged the light v1
  system "too basic to read"; full rewrite to a dark, chart-first console
  with Claude Design (`site/design/`, readme.md = source of truth;
  docs/07 kept for history, marked SUPERSEDED).

### Sep 2-5 (migrated session): the science hardening
- **The 95%-null discovery**: 9,525 judgment rows, only 494 valid — a 7,784-
  call burst at 17:00 burned B.AI quota into a 403/429 storm, and judge.py
  counted nulls as done (they would NEVER retry). Five models had zero valid
  judgments. Fixed: valid-only done-keys, escalating token budgets (3,000 →
  19,700 across 5 attempts), under-judged models first, judge_workers 16 → 3
  (the 16 is what triggered the storm).
- **Self-judging bug found**: exact-name exclusion let qwen-judge grade
  qwen3.8-max (+4.6 pts bias). Fixed to family-based exclusion.
- **Hallucinated refusals**: judges claimed "the model refused" 106 times when
  it hadn't (105 from one judge). Precise refusal detection + fallback judge
  added. Third judge (hy) added; scoring moved 0/0.5/1 → continuous 0-100.
- **F6 redesigned** (the project's best methodological decision): from
  match-the-gold-key to argument-validity grading ("did the model build a
  specific, textfully-grounded case for whichever verdict it reached"), with
  the 25 F6 item questions rewritten to allow either verdict. Owner's worry
  that drove it: "a joke could be funny because it's unfunny" — the anti-humor
  edge case, logged as a known limit.
- **Spot-check skew**: the "100 balanced items" tool was 151/167 score-1.0s;
  the slider bug ("no matter what score I select it shows zero") fixed.
- **Human-agreement-as-benchmark**: owner's philosophical worry ("we're using
  human agreement to benchmark the benchmark, I feel lost") resolved into the
  standing design: judge-validity is the instrument's published uncertainty,
  not its validation — human alpha (3 raters × 100 items) is the real gate at
  C5, and the 100-item spot-check tool exists for the owner's own audits.
- **F1-F5 saturation confirmed** (92.5-98.4, ≤5.6 spread across 13 models);
  F6 the only discriminator (81-92, 11 pts). Site caption states it honestly.
  H2's kill rule acknowledged as arguably tripped — with the counterargument
  that the tier redesign IS the prescribed saturate-guard response.
- **Provider deaths begin**: deepseek free deal ended → deepseek-judge retired
  (family history preserved in config). hy4-preview retired (empty-content
  transient). explabs provider added (free frontier-tier: qwen3.8-27b,
  gpt-5.6-luna) for the safety gate.

### Sep 5-6: sourcing real jokes (the v0.3 data pipeline)
- Design: **one download, two uses** — r/Jokes + dadjokes corpus feeds LOL-A
  (real human jokes replace LLM-drafted F1-F5, with draft_tier T1/T2/T3 as a
  difficulty axis) and LOL-C (pairs with recorded upvote winners as ground
  truth). Zero A/C overlap enforced. Owner's framing that corrected the
  agent's backwards read: "the idea is we get real jokes instead of LLM
  jokes... and we use the same datapool for lolc but we get scores from the
  dataset."
- **Owner's curation catches** (each became a regression test): the pregnant
  cup-size joke (sexual innuendo the 2-model safety gate passed) and the
  Jesus-nail joke (faith mockery). Gate recalibrated to family-friendly
  standard, 8 regression cases, both finds verified gone by grep. Boundary
  case kept: gentle believer humor passes.
- Pipeline fixes from agent audits: loser floor `score_low >= 5` (53/59
  "losers" were score-0/1 spam — a model could pass C by detecting
  coherence), candidate pool 200 → 600, tier-3 targeted draw (7 → 15-81
  depending on gate version; long-form is edgiest, ~25-31% pass rate),
  text-reconstruction audit (15% of rows need title+body concatenation; the
  "mid-story" bug), near-dup Jaccard sweep (the attire/tire joke existed 3x;
  the same joke scored 741 in one post and 23 in another — recorded as proxy
  evidence for the limitations section).
- **The curation-pass debate, settled by the owner**: agent proposed owner
  review of ~50 items across 5 categories; owner pushed back category by
  category (completeness: "it's real data, obviously fine"; tier plausibility:
  "I can't bucket them myself"; safety: "we've done multiple passes";
  C-pairs: already done). Agent conceded 3 of 5 ("my flags were garbage" —
  the no-terminal-punctuation 'problems' were just Reddit style), held the
  line on near-dups with proof. Net: pipeline filters + ~10 boundary flags
  per pool replace the human read-through. Curation gate closed.
- **The 52% result (owner's blind review of LOL-C pairs)**: agreement with
  recorded Reddit winners at chance (15/29), disagreements spread across ALL
  gap sizes including 3,059-vs-5. Meaning absorbed into doctrine: there is no
  objective funnier; the recorded winner is a crowd-preference FACT; models
  will be measured against the human ceiling, and the owner's 52% IS the
  first human-baseline measurement. Statistical consequence: 130 pairs gives
  ±8.6 pt noise bands; C needs ~300+ pairs for teeth.
- **Honeypot probes shipped** (owner's idea: "can we not mix some of these
  lol-c ones into the data collection we're already using in lol-b"): 30
  reviewed pairs rotate into the vote booth at 1:5, `kind` column lanes the
  votes, standings never read the probe lane, reveal shows the crowd favorite
  + agreed/disagreed. One smoke-test ballot disclosed on the record.

### Sep 6-7: pilot then full v0.3 run
- **LOL-C harness** built by subagent (run_c.py): temp 0.0, strict JSON picks,
  checkpointed outputs_c/, accuracy + bootstrap CI + Spearman A-vs-C
  correlation, no judge LLM anywhere. Smoke-tested only; deliberately NOT run
  — the doctrine became "collect human data first, run models second," or a
  model score without the human ceiling is a number without a meaning.
- **Pilot (50 items, 13 models)** answered the redesign question: the ceiling
  broke. Whole band dropped 4-6 pts below the old floor; spread 7-12 pts at
  every tier; the "inversion" discovered (models score HIGHEST on T3 —
  longer jokes give more citable material under argument-validity grading;
  tiers measure format-driven behavior, not difficulty-as-lower-scores —
  framed as a finding, not a flaw). Cost estimate missed ~2x again
  ($2.65 quoted, ~$5-6 actual): tier-3 inputs run long, reasoning runs hot.
- **v0.3 cutover**: 396-item A set (T1 276 / T2 80 / T3 15 + F6 25 verbatim),
  F1-F5 purged, dataset_version 0.3.0, run_v03.ps1 resume-safe wrapper
  (survives kill/WiFi-death/reboot by design; owner's explicit requirement),
  purge validated by dry run, bump_version.py replacing inline python -c
  (PowerShell quote-mangling lesson, twice).
- **Call-budget arithmetic** (owner: "13 models and 371 items, how is it
  9k?"): 8 full models × 371 × 3 samples + 5 anchors × 371 × 1 ≈ 10,759
  generation calls; ~26,700 judgment rows. Judging is ~90% of wall clock.
- **The parallelization argument (owner's biggest technical win)**: agent
  claimed more keys wouldn't help ("latency-bound, 15% of ceiling"); owner
  kept pushing ("8 workers on a new key, 16 total — how does this not get
  done faster?"). Agent re-checked, found 943 throttled calls proving the
  effective ceiling was ~10-15 rpm per key, conceded the hole in its argument,
  and implemented per-key rotation. Result: judge throughput 6-10/min → 26/min,
  429s dropped to ~zero in the judge phase. On the record: "Score one for the
  parallelize-it instinct over my model."
- **Hack Club wall**: mid-run, HC went from fine to refusing everything (402s
  on all 14 probed slugs, qwen-max 429). Owner's diagnosis overrode agent's
  "out of credits" theory: HC has no payment rail; it's per-slug + account
  throttling from our hammering. Skip-and-rotate doctrine adopted (never
  grind a 429-only slug — it starves queued models).
- **OpenRouter burst** (owner: "just get as much runs as I can with whatever I
  have"): $0.42 metered finished mimo-pro (855 rows) and grok bulk (345).
  Measured ~$0.0005/row at our token shapes — 2x the naive estimate, AGAIN.
  Prepaid wallet = the hard 402 stop that worked. Agent's per-invocation
  guard framing error disclosed ($0.25 + $0.17 across two invocations).

### Sep 9-10: launch prep
- Vote-integrity fix (reveal only on confirmed write; the old optimistic UI
  silently lost 409/500 failures — "every lost vote is unrecoverable
  corruption of the exact dataset you're building").
- og/meta preview cards shipped after owner's Discord-embed question; v1
  generated image trashed by owner ("image looks terrible"), replaced with a
  real screenshot of the live hero. Mid-task the owner hit the brakes twice
  ("stop what are you doing" / "this is fucking insane") — recorded as the
  standing rule: do exactly what was asked, nothing more.
- Launch copy written per channel (casual for group chats, honesty-led for
  r/artificial, result-led for r/ArtificialInteligence, LocalLLaMA rules
  check first; Show HN with a builder's first comment). Timing plan: Thursday
  noon ET prime window. Group-chat push converted: 12 → 32 → 50 ballots.

### Sep 10-12: the launch and the feedback harvest
- Show HN + r/artificial + r/ArtificialInteligence + X quote-tweet of the
  origin thread. ~130 ballots, ~12 substantive commenters, 2 drive-by jokes.
- **Board published** (Sep 11 22:31): v0.3.0, 13 models, judge_validity
  n=18,774 (correlation 0.4114, mean_abs_distance 9.8 pts, exact_match
  6.35%). Leaders claude-opus-5 0.922 (thin data, coasting on F-rows, no
  T-rows), qwen3.8-max 0.917, grok-4.6 0.906; trailer mimo twins 0.837.
  Generation parked: claude/gemini 0/371 T-rows, gpt 251/371, muse 6/371,
  grok 348/371 — all queued on Hack Club windows.
- **Every piece of feedback, and what it became** (full ledger in
  docs/08-launch-log.md):
  1. Neither option (OriginalHospital + sergey_v + 35-50% tie-rate behavior)
     → shipped same-day: distinct stored outcome + stage-2 follow-up
     (didn't-get / got-it-not-funny / both-terrible + 500-char note,
     vote_feedback table). First 2 real neithers landed within hours;
     top matchup sat at a perfect 11-11-11.
  2. Em dashes as LLM tell (sergey_v) → banned in generate.md; wave-0 kept
     as-is (consistent history); cross-wave style delta = documented
     footnote.
  3. Stale-item freshness (sergey_v's Superbowl 2020 specimen) →
     freshness_check.py; first scan flagged 9/130 C-pool and exactly his
     specimen live (C-0082, triple-flagged); quarantine deferred to probe
     rotation for ballot continuity.
  4. Contamination (Chris-Hart_232) → standing attack, public honest answer
     (fresh B-premises; detection tests judgment; fresh human-written items
     are the structural fix — roadmap queue #4).
  5. Counterfactual theory of F6 (Past_Floor_2405 + litocampo23 +
     NeuralNomad87, three independent derivations) → the strongest research
     finding. The owner forced the correct test layer (candidate
     explanations, not judge rationales — agent initially grepped the wrong
     pile and drafted a reply around an irrelevant number; caught before
     posting). Corrected check over the 725-explanation corpus: "timing" in
     0.3% of low-scoring vs 2.7% of high-scoring (the word marks GOOD
     explanations); "doesn't land" in 72% of low-scoring — bad explanations
     say THAT it fails without WHY, exactly what counterfactual theory
     predicts. Rubric-priming confound disclosed ("expectation"/"incongruity"
     are in our prompt; "doesn't land" is clean signal).
  6. Familiarity confound (NeuralNomad87, "the best comment of the launch"):
     famous jokes ship with commentary in training data, so explaining them
     is partly retrieval; failed jokes have no literature, so diagnosing
     them is pure generation; the 95-vs-81 gap may measure recall-vs-reasoning
     distance. His kill-test (obscure real jokes; if 95 collapses, the axis
     is familiarity) queued as experiment #1. Noted twist: if confirmed, F6
     becomes the only uncontaminated tier, making the result STRONGER.
  7. Formatting crutches (Lower-Ad-6293: models lean on !!! and dashes to
     signal "punchline happened") → planned display-layer normalizer (em dash
     → comma, !!! → !, CAPS → normal; keep periods/commas/question marks/
     line breaks because punctuation can BE the timing). Not yet built.
  8. Cohort agreement (NeuralNomad87 point B: global averages wash out the
     interesting variance; "probably the thing that actually varies between
     them") → planned optional "how online are you?" booth question; the
     board's 0.837-0.922 compression is evidence-shaped like his theory.
  9. Anti-humor boundary (AffectionateGas9544 = the owner, in-thread:
     "sometimes the unfunniness makes it funny") → F6 known limit, methods
     footnote, possible F7 family.
  10. Jokes logged for voice (tertiary shame; "if AI takes my coding job
      I should become a standup comedian"; fortune-cookie punchlines;
      "the timing feels like a sneeze that never comes" — the best one-line
      description of F6 anyone gave, going in the writeup; "waiting for the
      machines to understand why a pun doesn't land"; "once your benchmark
      has to calculate Elo for dad jokes delivered ironically, throw away
      the loss function"; one sarcastic drive-by correctly ignored —
      ~10:1 substantive ratio = reaching outside the friendly bubble).
- **The timing-check moment as a process milestone**: a commenter made a
  testable prediction; the benchmark tested it same-day on its own data.
  "The benchmark can TEST its community's theories" — recorded as the
  differentiator.
- **glm-judge death** (Sep 12): b.ai cut glm-5.3-flash free quota to 0 on
  all 3 keys → glm-judge retired (same pattern as deepseek-judge); 2-judge
  floor (qwen + hy) holds for all pending models; historical coverage intact
  (hy 2,457 + glm 2,457 on qwen rows). Standing priority: recruit a 3rd
  judge from any non-qwen family.
- **Thursday launch cadence adopted**: weekly launches with venue rotation
  (never repost the same link to the same sub; self-promo rules enforced
  per-sub); Show HN only on overhaul substance, at most every 2-4 weeks
  (the owner pasted HN's own rules to settle the argument); regular
  submissions (technical deep-dives, result writeups) fill the gaps with no
  repost restriction; reply-sprint ~2h; "you asked, we built" posts tag the
  requesters.

## 5. The mishap ledger (every one, with root cause)

| # | Mishap | Root cause | Fix |
|---|---|---|---|
| 1 | Subagent "completed" with no files (x2) | unverified delegation | agent wrote items directly; verify the artifact |
| 2 | 625 calls 401 | PS 5.1 UTF-8 BOM mangled .env key | ASCII .env, single line per key |
| 3 | Empty outputs scored 0 | reasoning tokens eat max_tokens | 2x budget retry + empty flag |
| 4 | $10.94 of $14 burned overnight | reasoning tokens ~2.5x estimate | cost log + max_spend_usd + think:false |
| 5 | xAI GET worked / POST failed | duplicate XAI_API_KEY lines | last-wins .env rewrite |
| 6 | "Gemini safety filter" misdiagnosis | 400s never read; transient routing | read error bodies; retracted the finding |
| 7 | Leaderboard blank / dots forever | missing tab wiring + boot() cascade | error-isolated renders |
| 8 | "100 ± 0" from n=3 | zero-width CI on tiny n | Wilson floor + n>=10 display floor |
| 9 | 95% of judgments null, never retrying | nulls-as-done + 16-worker quota storm | valid-only done-keys; workers 3 |
| 10 | qwen-judge graded qwen3.8-max | exact-name not family exclusion | family tags, exclusion in scoring too |
| 11 | 106 hallucinated refusals | judge invented refusals | precise detection + fallback judge |
| 12 | F6 "100% done" with 2 models at zero | trusted "run complete" | per-model family counts |
| 13 | Spot-check tool always scored 0 | slider bug | fixed, Playwright-verified |
| 14 | Vote button recorded every click as tie | UI bug | fixed; every historical "tie" pre-fix is suspect |
| 15 | Votes lost on 409/500 | optimistic UI | reveal-only-on-confirmed-write |
| 16 | Sourced jokes starting mid-story | title/body length heuristic | containment check + concat branch |
| 17 | 53/59 C-losers were spam | no loser floor | score_low >= 5 + pool 600 |
| 18 | NSFW/religion escapes | gate calibrated looser than owner | owner's finds = regression tests |
| 19 | attire/tire joke 3x across tracks | SHA-1 exact dedup only | Jaccard near-dup sweep |
| 20 | Pilot cost 2x estimate (again) | long inputs + hot reasoning | repriced; lesson logged 3rd time |
| 21 | run_v03 version bump crashed | inline python -c quoting | bump_version.py file |
| 22 | HC "out of credits" misdiagnosis | 402s on a free rail | owner's throttle read adopted |
| 23 | Muse 429 tar pit starving queue | grinding a dead slug | skip-and-rotate doctrine |
| 24 | Guard framing error ($0.25+$0.17) | per-invocation cap vs session | disclosed; estimate-only cap noted |
| 25 | Judge grepped wrong text pile | judge rationales ≠ candidate explanations | owner caught it; re-ran correct layer |

The meta-lesson written into the operating record: **every failure was a claim
accepted without direct verification.** The corrective is one rule — verify the
artifact, not the exit code.

## 6. Standing decisions and doctrine

- **Naming/branding**: LOL Bench, lolbench.lol, origin thread credited
  (permission DM still owed to the tweet author).
- **Stack**: static site + Vercel edge functions + Supabase free tier;
  auto-deploy on push; no CI, no org, no framework. "The benchmark is the
  product; the site is its face."
- **Benchmark reruns forever = three commands**: run.py → judge.py → score.py.
- **Scoring honesty**: bootstrap CIs with Wilson floor; n>=10 display floor;
  every number stamped (dataset_version, harness_hash); PRELIMINARY until
  human alpha exists; judge-validity on the page; rank bands not Elo below
  jury-human 0.6 agreement; no spend/cost figure on the public site (owner's
  rule, overriding design doc §9.5: a provider's promo free tier is a
  business fact, not a model fact).
- **Judge protocol**: >=2 heterogeneous judges, family-disjoint (never score
  your own family), continuous 0-100, argument-validity rubric for F6 and the
  T-tiers, escalating budgets, fallback judges, judge_validity recomputed per
  wave. Retirements preserved in config with history.
- **Provider doctrine** (learned the hard way, week one): >=2 live providers
  per lane; free tiers are for burst windows, prepaid wallets are finishing
  moves, throttles are for waiting out; never grind a 429-only slug; re-read
  ToS quarterly; free-tier hits have now killed two judges (deepseek, glm).
- **Voting data**: no accounts, no PII, IP-hash dedupe, one ballot per
  (voter, matchup) at the DB, RLS on, kind-laned probes never touch model
  standings, notes never scored, cohort question will be optional/nullable.
- **Curation doctrine**: real data + pipeline filters + owner spot-catches as
  regression tests; the 372-item human read-through is dead; ~10 boundary
  flags per future pool is the review surface.
- **LOL-C doctrine**: recorded winner = crowd-preference fact, not objective
  funniness (owner's 52% proved it); models measured against the published
  human ceiling; collect human data (probes) before running models; ~300+
  pairs needed for statistical teeth.
- **Anti-thrash rule for the agent**: do exactly what was asked, nothing more
  (born from two mid-task "stop, what are you doing" interventions over the
  og-image).
- **Thursday cadence** with rotation rules and one visible ship per launch.

## 7. Where everything stands at record close (2026-09-12)

| Thing | State |
|---|---|
| Site | LIVE at lolbench.lol (www + apex), auto-deploy on push, v0.3.0 board live, neither + stage-2 + probes + og cards + analytics |
| LOL-A | 13 models published; 396-item v0.3 set (T1 276 / T2 80 / T3 15 / F6 25); n>=10 met on 8 models; pilot proved tiers discriminate; judge_validity n=18,774 |
| LOL-B | Vote booth live; 124 ballots, 14 matchups, top matchup 11-11-11; Elo deferred to C5 volume |
| LOL-C | 130 pairs locked; harness built but unrun (collect-first doctrine); 30 probes live at 1:5; ~10 probe ballots (mostly smoke) — needs ~600-900 |
| Generation | Parked on Hack Club windows: claude 0/371 T-rows, gemini 0/371, gpt 251/371, muse 6/371, grok 348/371 |
| Judges | qwen + hy live; glm + deepseek retired; 3rd judge recruitment = standing priority |
| C5 gate | NOT started: alpha (3 raters x 100 items), contamination permutation test, H1/H2 verdicts; 5 models need T-rows |
| Money | ~$15-16 lifetime spent, all measured in cost_log.jsonl; spend guard live; every provider lesson priced |
| Community | ~12 substantive commenters; 10-item feedback ledger; 3 converging theories; 2 shipped upgrades; 2 standing invitations (NeuralNomad kill-test, Lower-Ad normalizer) |
| Docs | 01-08 current through the launch log; this file (09) = the full record |

## 8. Next steps (priority order, from the roadmap queue)

1. **Familiarity kill-test** (NeuralNomad87): ~50 genuinely obscure real jokes
   through the explain-and-grade pipeline, free pipes. Either outcome
   publishable; if confirmed, F6 becomes the only uncontaminated tier.
2. **Formatting normalizer** (Lower-Ad-6293): display-layer only, ~20 lines,
   retroactive at render time, no rerun.
3. **Cohort question** (NeuralNomad87): optional "how online are you?",
   nullable column, per-cohort agreement alongside global.
4. **Community joke submissions**: a submit box behind the booth —
   definitionally post-cutoff content; slow volume but compounds weekly.
5. **F6 corpus expansion**: double the 725-explanation counterfactual corpus;
   control the rubric-priming confound with a variant rubric.
6. Resume parked T-row generation when Hack Club burst windows open; recruit
   the 3rd judge; then C5: alpha, permutation test, H1/H2 verdicts.
7. Keep the Thursday cadence: ship one visible thing per launch, tag the
   requesters, log the feedback, close the loop publicly.

## 9. The one-paragraph retrospection

Week one turned a tweet-reply dare into a live, community-audited measurement
instrument. The owner's instincts repeatedly beat the agent's models: naming
it LOL Bench for the callback, parallelizing with more keys, reading Hack
Club's 402s as throttling not billing, refusing the Llama/Muse confusion,
catching the NSFW escapes, catching the wrong-pile grep, killing spend from
the public site, and demanding "neither" before the data proved it. The
agent's value was grounding every plan in verified sources, building the
whole stack in hours, and — after being forced by evidence — writing down
every mistake in a form that became doctrine. The benchmark's own community
now stress-tests its methodology for free and writes its limitations section
in public. The moat (honest error bars, shipped negative results, tested
community theories) is exactly what the research said the category lacked.

# LOL Bench — Execution Plan (checkpoints, no dates)

Principle: gates protect CLAIMS, not visibility. Ship the site immediately; ship calibration claims only when earned.

## Checkpoints

### C0 — Skeleton up
- Register domain; personal GitHub repo `lolbench` (public; org only if a second person ever joins).
- Minimal scaffold (no CI, no org, no process artifacts):
  - `data/` — lol_a_items.jsonl, lol_b_wave0_premises.jsonl, lol_c_pools.jsonl, private/ (gitignored)
  - `harness/` — prompts/ (pinned), config.yaml, run.py, judge.py, score.py
  - `site/` — index.html (reads results.json), api/vote.js (Supabase insert + IP throttle)
  - `results/` — stamped result JSONs (dataset_version, harness_hash)
- Landing page v0: origin story (screenshot, permission pending), PRELIMINARY banner, "scores populating".
- **Gate:** domain resolves; repo clones; site live with zero scores honestly labeled.

### C1 — Items exist
- Agent-draft 150–200 LOL-A items (F1–F6); owner curates 100%.
- LOL-C pools imported with provenance datasheets; license-clean only.
- Wave-0 generation set: 40 constrained premises.
- Canaries + dedup baked in.
- **Gate:** item file committed with schema + provenance; 0 uncurated items.

### C2 — Harness frozen
- Pinned prompts/templates/decoding/judge prompts; version stamping; queue-based runner (rate-limit aware).
- Judge selected from a family not present in candidate pool.
- **Gate:** one model scored end-to-end from clean checkout on a fresh machine, reproduced to identical (hash, score).

### C3 — Preliminary leaderboard live
- Candidates: 3 open models (local Mac Studio and/or Groq/Cerebras free) + capped Gemini slot + owner-keyed frontier slots.
- n=3–5 (documented deviation; raised to 10 at C5).
- Human spot-check of 20 judge-graded samples BEFORE publish (mis-scoring judge on day 1 = credibility death).
- Publish: LOL-A accuracy, LOL-C correlation, LOL-B wave-0 win rates + Wilson CIs + raw sample transparency.
- **Gate:** real numbers on the domain, every number with n and CI.

### C4 — Beta voting live
- Anonymous pairwise voting, model-vs-model; one click; rate-limited; no accounts.
- Votes accumulate to a queue (future calibration data — the viral feature and the science feature are the same feature).
- **Gate:** a stranger can vote from a phone; spam smoke-test passed.

### C5 — Credibility pass
- Items → ~500 + private split; n=10; friends-as-annotators alpha (3 raters x 100 items); contamination permutation test on open models.
- Test H1 (A-vs-C dissociation) and H2 (non-saturation), pre-registered verdicts either way.
- If vote volume sufficient: upgrade win rates → BT Elo.
- Banner upgrades: PRELIMINARY → "auto-judged, human calibration in progress" (Track A) once alpha published.
- **Gate:** alpha + judge-validity + H1/H2 verdicts published, including negative results.

### C6 — LOL-B wave 1
- Full constraint matrix; human anchors enter (licensed/paid/opt-in); judge calibration vs human votes (~1,000-vote human batch target).
- Jury–human agreement >= 0.6 → point Elo. Below → rank bands, stated plainly on the page.
- **Gate:** first true Elo (or honest rank bands) + judge-validity score on the leaderboard.

### C7 — Operating rhythm
- Fresh premise waves; item retirement; quarterly audits; saturate-guard rule enforced.
- **Gate:** two consecutive clean waves with published alpha, judge validity, CIs = the instrument is real.

## Day-1 critical path (owner vs agent)
Owner-only: curate all items (B), supply API keys (D), DM the tweet guy (A), eyeball 20 graded samples (C).
Everything else is agent-scriptable: scaffold, harness, runner, site, Supabase schema, vote API.

## LOL-B note (why day-1 B looks different from A and C)
- A and C are scored by the harness (judge model / correlation math).
- B at wave-0 is scored by the PUBLIC: anonymous site voting is the judge. run.py generates, judge.py does NOT touch B, score.py computes per-matchup win rates + Wilson CIs from votes. Elo only arrives when vote volume justifies BT fitting (C5+).

## Dependency line
C0 → C1 → C2 → C3 (site + first scores) → C4 (voting) → C5 (credibility) → C6 (Elo) → C7 (rhythm).
C3 and C4 are the "show him" moment. C5+ is deliberately not launch-shaped.

## Kill criteria (from governance doc)
If H2 fails (LOL-A saturates) or LOL-C shows no signal beyond crowd-upvote regression → stop or pivot; publish what exists as a negative/limited result. Cost before C5 is trivial by design; nothing expensive is ever built on hope.

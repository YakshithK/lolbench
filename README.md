# LOL Bench

A benchmark for whether LLMs can appreciate, produce, and discriminate humor — built credibility-first, in public.

Origin: someone posted they were *"looking to fund someone making LLMs funny"*. A quote tweet asked *"Who's building LOL bench?"* The reply: *"Give me a few hours."* The response: *"Get this guy a job stat."* This is the answer.

## Status
SPEC ONLY — no code yet. All numbers below are from verified research (see `docs/`).

## De-scoped on day 1 (deliberately)
No GitHub org, no CI, no datasheets, no versioning machinery. The whole benchmark reruns via three commands: `run.py` → `judge.py` → `score.py`. Institutional upgrades happen only when contributors appear.

## The three tracks
| Track | Question | Method |
|---|---|---|
| **LOL-A** (appreciate) | Can it understand the joke? | Rubric-scored comprehension items, auto-judged |
| **LOL-B** (produce) | Can it make humans laugh? | Constrained generation, human voting → win rates → Bradley-Terry Elo |
| **LOL-C** (discriminate) | Does its internal sense of humor match ours? | Rank correlation against human-rated joke pools |

## Locked decisions
- Domain: `LOL Bench.lol`
- Stack: static site + serverless functions (Vercel) + Supabase free tier
- Day-1 voting: model-vs-model only (human anchors deferred to C6, licensing)
- Inter-annotator agreement: friends as annotators (deferred priority, non-blocking)
- API keys: owner-supplied; open models can run locally on Mac Studio 64GB
- Openness: open code, split data (private test items — GSM1k-standard)
- Items: agent-drafted, 100% human-curated
- Credit the origin tweet (with permission)

## Everything else
- `docs/01-vision.md` — why this, thesis, positioning
- `docs/02-benchmark-spec.md` — tracks, items, scoring, statistics, judge protocol
- `docs/03-execution-plan.md` — checkpoints C0–C7, gates, day-1 critical path
- `docs/04-compute-and-keys.md` — call budgets, hardware roles, API matrix
- `docs/05-governance.md` — kill criteria, ethics, contamination policy, labeling rules
- `docs/06-longterm-roadmap.md` — post-launch direction

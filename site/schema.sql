-- LOL Bench schema. Run once in the Supabase SQL editor.

create table if not exists votes (
  id bigint generated always as identity primary key,
  matchup_id text not null,
  premise_id text not null,
  model_a text not null,
  model_b text not null,
  winner text not null check (winner in ('A','B','tie','neither')),
  voter_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists votes_matchup_idx on votes (matchup_id);
create index if not exists votes_created_idx on votes (created_at);

-- Both api/vote.js and api/leaderboard.js talk to Supabase only with the
-- service-role key from a Vercel edge function - the browser never holds
-- Supabase credentials. Service-role bypasses RLS regardless, so this has
-- zero effect on the app today; it's a floor against a future anon/authenticated
-- key ever reaching this table (no policies = zero access for those keys).
alter table votes enable row level security;

-- Aggregated view the leaderboard API reads.
create or replace view vote_counts as
select
  matchup_id,
  premise_id,
  model_a,
  model_b,
  count(*) filter (where winner = 'A') as wins_a,
  count(*) filter (where winner = 'B') as wins_b,
  count(*) filter (where winner = 'tie') as ties,
  count(*) filter (where winner = 'neither') as neithers,
  count(*) as total
from votes
group by matchup_id, premise_id, model_a, model_b;

-- One ballot per (voter, matchup): a refresh that re-rolls the SAME pairing,
-- or a direct repeat call to /api/vote with the same matchup_id, is rejected
-- at the database level (PostgREST returns 409 on the unique violation).
-- A voter can still vote on a DIFFERENT matchup — this stops stuffing one
-- pairing, not repeat legitimate participation.
create unique index if not exists votes_one_per_matchup on votes (voter_hash, matchup_id);

-- LOL-C honeypot probes (2026-09-05): human-written Reddit pairs served blind
-- inside the vote rotation so every visitor vote doubles as a human-vs-crowd
-- data point. Probe rows carry kind='c' with null premise/models; the
-- vote_counts view below aggregates them harmlessly (NULLs group together)
-- and model standings never read them (standings render from LOL-A scores;
-- the only vote_counts consumer looks rows up per matchup_id for counts).
-- All statements idempotent: safe to re-run the whole file from scratch.
alter table votes add column if not exists kind text not null default 'b';
alter table votes alter column premise_id drop not null;
alter table votes alter column model_a drop not null;
alter table votes alter column model_b drop not null;

-- Neither-vote support (2026-09-12): 'neither' is a DISTINCT stored outcome
-- (voter found nothing funny), not a tie. Old tie rows stay ties - they can
-- never be retro-split, so pre-neither tie-rates aren't strictly comparable
-- to post-neither ones. Run this block once in the Supabase SQL editor, then
-- deploy the site (vote.js + ballot UI already accept 'neither').
-- If neither votes still 400 after this, check \d votes for a stale
-- auto-named check constraint from the original CREATE TABLE and drop it.
alter table votes drop constraint if exists votes_winner_check;
alter table votes add constraint votes_winner_check check (winner in ('A','B','tie','neither'));
create or replace view vote_counts as
select
  matchup_id,
  premise_id,
  model_a,
  model_b,
  count(*) filter (where winner = 'A') as wins_a,
  count(*) filter (where winner = 'B') as wins_b,
  count(*) filter (where winner = 'tie') as ties,
  count(*) filter (where winner = 'neither') as neithers,
  count(*) as total
from votes
group by matchup_id, premise_id, model_a, model_b;

-- Stage-2 neither follow-up (2026-09-12): optional WHY behind a neither
-- ballot plus a free-text note. Stored, never scored. One row per
-- (voter, matchup). Run once in the Supabase SQL editor alongside the
-- neither block above, then deploy the site (feedback.js + ballot UI
-- already call it).
create table if not exists vote_feedback (
  id bigint generated always as identity primary key,
  matchup_id text not null,
  premise_id text,
  model_a text,
  model_b text,
  kind text not null default 'b',
  reason text not null check (reason in ('didnt-get','not-funny','both-terrible')),
  note text,
  voter_hash text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists vote_feedback_one_per_matchup on vote_feedback (voter_hash, matchup_id);
alter table vote_feedback enable row level security;

-- LOL Bench schema. Run once in the Supabase SQL editor.

create table if not exists votes (
  id bigint generated always as identity primary key,
  matchup_id text not null,
  premise_id text not null,
  model_a text not null,
  model_b text not null,
  winner text not null check (winner in ('A','B','tie')),
  voter_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists votes_matchup_idx on votes (matchup_id);
create index if not exists votes_created_idx on votes (created_at);

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
  count(*) as total
from votes
group by matchup_id, premise_id, model_a, model_b;

-- One ballot per (voter, matchup): a refresh that re-rolls the SAME pairing,
-- or a direct repeat call to /api/vote with the same matchup_id, is rejected
-- at the database level (PostgREST returns 409 on the unique violation).
-- A voter can still vote on a DIFFERENT matchup — this stops stuffing one
-- pairing, not repeat legitimate participation.
create unique index if not exists votes_one_per_matchup on votes (voter_hash, matchup_id);

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

-- Basic duplicate-vote damping per matchup (read-only guard: leaderboard
-- counts every vote, but anomalies are visible via voter_hash distribution).
create index if not exists votes_voter_idx on votes (voter_hash, matchup_id);

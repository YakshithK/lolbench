export const config = { runtime: "edge" };

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

/* Wilson score interval, 95%. Used instead of a normal approximation because
   these are small-n proportions (single digits to low dozens of decisive
   ballots per model), where the normal approximation runs off both ends. */
function wilson(wins, n) {
  if (!n) return null;
  const z = 1.96, p = wins / n;
  const denom = 1 + (z * z) / n;
  const center = (p + (z * z) / (2 * n)) / denom;
  const half = (z / denom) * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return { lo: Math.max(0, center - half), hi: Math.min(1, center + half) };
}

/* Per-model decisive-ballot win rate, aggregated here rather than in
   score.py so the numbers stay live as ballots land. A "decision" is a ballot
   that picked a model; ties and 'neither' are excluded from BOTH numerator and
   denominator, so the rate answers "when a voter picked a winner, how often was
   it this model" and not "how often did it avoid being tied". */
function aggregate(rows) {
  const wins = {}, dec = {};
  rows.forEach(r => {
    if (!r.model_a || !r.model_b) return;      // kind='c' probe rows carry nulls
    const d = (r.wins_a || 0) + (r.wins_b || 0);
    if (!d) return;
    [r.model_a, r.model_b].forEach(m => {
      wins[m] = (wins[m] || 0) + (r["wins_" + (m === r.model_a ? "a" : "b")] || 0);
      dec[m] = (dec[m] || 0) + d;
    });
  });
  return Object.keys(dec).map(name => {
    const n = dec[name], w = wins[name], ci = wilson(w, n);
    return {
      model: name, wins: w, decisions: n,
      rate: n ? w / n : 0,
      lo: ci.lo, hi: ci.hi,
    };
  }).sort((a, b) => b.rate - a.rate);
}

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers: cors });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "not configured" }), { status: 500, headers: cors });
  }

  const r = await fetch(`${SUPABASE_URL}/rest/v1/vote_counts?select=*&order=total.desc`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });

  if (!r.ok) {
    return new Response(JSON.stringify({ error: "db error" }), { status: 502, headers: cors });
  }
  const data = await r.json();
  const models = aggregate(data);
  const totals = {
    ballots: data.reduce((s, r) => s + (r.total || 0), 0),
    decisive: data.reduce((s, r) => s + (r.wins_a || 0) + (r.wins_b || 0), 0),
    matchups_voted: data.filter(r => r.total > 0).length,
  };
  return new Response(JSON.stringify({ matchups: data, models, totals }), {
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  });
}

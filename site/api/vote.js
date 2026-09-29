export const config = { runtime: "edge" };

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function hashIp(ip) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("lolbench:" + ip));
  return Array.from(new Uint8Array(buf)).map((x) => x.toString(16).padStart(2, "0")).join("");
}

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method not allowed" }), { status: 405, headers: cors });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: "not configured" }), { status: 500, headers: cors });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad json" }), { status: 400, headers: cors });
  }

  const { matchup_id, premise_id, model_a, model_b, winner, kind, cohort } = body;
  // kind 'c' = LOL-C honeypot probe (human-written pair, no models involved).
  // kind 'k' = kill-test human verification: ONE obscure joke, human answers
  //   whether it lands. This is the lane that answers "is this obscure joke
  //   actually funny", which the 20-500 upvote band only ever approximated.
  // Anything else is a normal model bout. Each lane is constrained to its own
  // id prefix with null model fields so model votes can't hide in a probe lane
  // (and vice versa) - standings integrity depends on the lanes staying apart.
  const k = kind === "c" || kind === "k" ? kind : "b";
  // The k-lane reuses the existing winner vocabulary rather than adding values,
  // so it needs no schema migration and cannot be rejected by the votes_winner_check
  // constraint on an un-migrated database. Mapping is fixed and lives in the UI:
  //   "A"       -> the joke lands
  //   "B"       -> it is not funny
  //   "neither" -> it is broken / does not parse as a joke at all
  // "tie" is unused in this lane; a single joke cannot be tied.
  const kWinner = k === "k" ? ["A", "B", "neither"].includes(winner) : true;
  // Optional audience tag (cohort-agreement question). Anything outside the
  // known set stores as null instead of rejecting the ballot - a vote must
  // never fail over an optional field.
  const co = ["very", "somewhat", "rarely"].includes(cohort) ? cohort : null;
  const valid =
    typeof matchup_id === "string" &&
    ["A", "B", "tie", "neither"].includes(winner) &&
    (k === "b"
      ? (typeof premise_id === "string" &&
        typeof model_a === "string" &&
        typeof model_b === "string" &&
        model_a !== model_b)
      : (k === "k"
        ? (/^K-CAND-\d+$/.test(matchup_id) &&
          kWinner &&
          (premise_id == null) &&
          (model_a == null) &&
          (model_b == null))
        : (/^C-\d+$/.test(matchup_id) &&
          (premise_id == null) &&
          (model_a == null) &&
          (model_b == null))));
  if (!valid) {
    return new Response(JSON.stringify({ error: "bad payload" }), { status: 400, headers: cors });
  }

  const ip =
    req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const voter_hash = await hashIp(ip);

  const r = await fetch(`${SUPABASE_URL}/rest/v1/votes`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ matchup_id, premise_id: premise_id || null, model_a: model_a || null, model_b: model_b || null, winner, voter_hash, kind: k, cohort: co }),
  });

  if (r.status === 409) {
    return new Response(JSON.stringify({ error: "already voted on this matchup" }), { status: 409, headers: cors });
  }
  if (!r.ok) {
    return new Response(JSON.stringify({ error: "db error" }), { status: 502, headers: cors });
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
}

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

// Stage-2 follow-up: after a "neither" ballot the voter may optionally say WHY
// (didn't get it / got it, wasn't funny / both were terrible) plus a free-text
// note. One row per (voter, matchup); notes are stored, never scored.
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

  const { matchup_id, premise_id, model_a, model_b, kind, reason, note } = body;
  const k = kind === "c" ? "c" : "b";
  const cleanNote = typeof note === "string" ? note.slice(0, 500) : null;
  const valid =
    typeof matchup_id === "string" &&
    ["didnt-get", "not-funny", "both-terrible"].includes(reason) &&
    (cleanNote === null || cleanNote.length <= 500) &&
    (k === "b"
      ? (typeof premise_id === "string" &&
        typeof model_a === "string" &&
        typeof model_b === "string" &&
        model_a !== model_b)
      : (/^C-\d+$/.test(matchup_id) &&
        (premise_id == null) &&
        (model_a == null) &&
        (model_b == null)));
  if (!valid) {
    return new Response(JSON.stringify({ error: "bad payload" }), { status: 400, headers: cors });
  }

  const ip =
    req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const voter_hash = await hashIp(ip);

  const r = await fetch(`${SUPABASE_URL}/rest/v1/vote_feedback`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ matchup_id, premise_id: premise_id || null, model_a: model_a || null, model_b: model_b || null, kind: k, reason, note: cleanNote && cleanNote.trim() ? cleanNote.trim() : null, voter_hash }),
  });

  if (r.status === 409) {
    return new Response(JSON.stringify({ error: "already gave feedback on this matchup" }), { status: 409, headers: cors });
  }
  if (!r.ok) {
    return new Response(JSON.stringify({ error: "db error" }), { status: 502, headers: cors });
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
}

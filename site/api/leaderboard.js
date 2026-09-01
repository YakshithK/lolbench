export const config = { runtime: "edge" };

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

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
  return new Response(JSON.stringify(data), {
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  });
}

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

/* Arm R intake: a joke plus the link that proves when it was written.
   The link is required. Arm R's claim is that the item postdates model training
   cutoffs, and that claim is only checkable against a timestamp we can see. A
   submission without one cannot be admitted, so it is rejected here rather than
   silently queued for someone to triage later.

   Nothing in this handler decides whether a joke is good, funny, or safe. It
   checks shape and provenance only; the human "does it land" lane and the
   owner's read do the rest. */
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

  const { joke, source_url, context } = body;

  const trim = v => (typeof v === "string" ? v.trim() : "");
  const j = trim(joke);
  const u = trim(source_url);
  const c = trim(context);

  // Length floors are not arbitrary: below ~25 chars there is no joke to grade,
  // and above 600 it is a story, a wall of text, or an attempt to smuggle a
  // prompt past the curation step that follows.
  if (j.length < 25 || j.length > 600) {
    return new Response(JSON.stringify({ error: "joke must be 25-600 characters" }), { status: 400, headers: cors });
  }
  if (c.length > 400) {
    return new Response(JSON.stringify({ error: "context must be under 400 characters" }), { status: 400, headers: cors });
  }

  // Accept http and https only. A javascript: or data: URL is not a citation,
  // it is an attempt to render or exfiltrate, and it has no timestamp either.
  let parsed;
  try {
    parsed = new URL(u);
  } catch {
    return new Response(JSON.stringify({ error: "source link required" }), { status: 400, headers: cors });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return new Response(JSON.stringify({ error: "source link must be an http or https address" }), { status: 400, headers: cors });
  }
  if (u.length > 500) {
    return new Response(JSON.stringify({ error: "source link too long" }), { status: 400, headers: cors });
  }

  const ip =
    req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const submitter_hash = await hashIp(ip);

  const r = await fetch(`${SUPABASE_URL}/rest/v1/joke_submissions`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ joke: j, source_url: parsed.toString(), context: c || null, submitter_hash }),
  });

  if (r.status === 409) {
    return new Response(JSON.stringify({ error: "you have already sent one in" }), { status: 409, headers: cors });
  }
  if (!r.ok) {
    return new Response(JSON.stringify({ error: "did not save" }), { status: 502, headers: cors });
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
}

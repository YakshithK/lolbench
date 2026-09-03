import React from "react";

/* Cost sits beside every score. Free is a fact, not a boast: it stays neutral. */
export function SpendCell({ usd, state }) {
  if (usd == null) return <span style={{ fontFamily: "var(--mono)", fontSize: "13px", color: state === "not started" ? "var(--accent-distrust)" : "var(--ink-3)" }}>{state || "queued"}</span>;
  return <span style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--ink-2)" }}>{usd === 0 ? "free" : "$" + usd.toFixed(2)}</span>;
}

import React from "react";

/* Risk to defense, joined by an arrow. Used where a reader might reasonably ask
   why a number here should be believed. */
export function DefenseRows({ rows = [] }) {
  return (
    <div style={{ display: "grid" }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 16px 1fr", gap: "10px", padding: "11px 0", borderBottom: i === rows.length - 1 ? 0 : "var(--border)", fontSize: "14px", fontWeight: 200, alignItems: "baseline" }}>
          <span style={{ color: "var(--ink-4)" }}>{r.risk}</span>
          <span style={{ color: "var(--accent-brand)", textAlign: "center" }}>→</span>
          <span style={{ color: "var(--ink)" }}>{r.defense}</span>
        </div>
      ))}
    </div>
  );
}

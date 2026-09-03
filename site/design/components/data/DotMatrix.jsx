import React from "react";

/* How much data is behind a number. One square per 10 graded answers, a partial
   square for the remainder, and the whole row in distrust orange when the
   sample is too thin to trust at all. */
export function DotMatrix({ rows = [], per = 10, thinBelow = 10 }) {
  return (
    <div style={{ display: "grid", gap: "13px" }}>
      {rows.map(r => {
        const thin = r.n < thinBelow;
        const color = thin ? "var(--accent-distrust)" : "var(--ink-mute)";
        const full = Math.floor(r.n / per);
        const rem = r.n % per;
        return (
          <div key={r.label} style={{ display: "grid", gridTemplateColumns: "150px 1fr 46px", gap: "14px", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>{r.label}</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
              {Array.from({ length: full }, (_, i) => <span key={i} style={{ width: "var(--square)", height: "var(--square)", background: color, display: "block" }} />)}
              {rem > 0 && <span style={{ width: Math.max(3, Math.round((rem / per) * 9)) + "px", height: "var(--square)", background: color, display: "block" }} />}
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "12px", color: thin ? "var(--accent-distrust)" : "var(--ink-2)", textAlign: "right" }}>{r.n}</span>
          </div>
        );
      })}
    </div>
  );
}

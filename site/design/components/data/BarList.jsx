import React from "react";

/* Completion bars: how much of an assigned set a model has finished. Neutral by
   rule, orange when barely started. Completion is never lime: finishing is not
   winning. */
export function BarList({ rows = [], target = 100, thinPct = 10 }) {
  return (
    <div style={{ display: "grid", gap: "11px" }}>
      {rows.map(r => {
        const pct = Math.min(100, (r.value / target) * 100);
        const color = pct <= thinPct ? "var(--accent-distrust)" : pct >= 95 ? "var(--ink-2)" : "var(--ink-4)";
        return (
          <div key={r.label} style={{ display: "grid", gridTemplateColumns: "136px 1fr 34px", gap: "10px", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "var(--caption-size)" }}>{r.label}</span>
            <div style={{ height: "var(--bar-h)", background: "var(--well)" }}>
              <i style={{ display: "block", height: "100%", width: pct + "%", background: color }} />
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "var(--caption-size)", color: "var(--ink-2)", textAlign: "right" }}>{r.value}</span>
          </div>
        );
      })}
    </div>
  );
}

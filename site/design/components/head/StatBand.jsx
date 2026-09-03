import React from "react";

/* Full-width hairline-gapped band of 3 to 4 facts. Closes a page; never used as
   a hero. Each cell is one mono numeral plus one plain sentence. */
export function StatBand({ stats = [] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(" + Math.max(1, stats.length) + ",1fr)", gap: "1px", background: "var(--rule)", border: "var(--border)", marginTop: "var(--gap-panel)" }}>
      {stats.map(s => (
        <div key={s.label} style={{ background: "var(--surface)", padding: "var(--band-pad)" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: "var(--label-size)", letterSpacing: "var(--label-tracking)", textTransform: "uppercase", color: "var(--ink-3)" }}>{s.label}</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "var(--data-lg-size)", fontWeight: 600, marginTop: "5px", fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
          {s.note && <p style={{ fontSize: "14px", fontWeight: 200, color: "var(--ink-4)", marginTop: "4px" }}>{s.note}</p>}
        </div>
      ))}
    </div>
  );
}

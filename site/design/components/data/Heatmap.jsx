import React from "react";

/* Model by joke-mechanism grid. The sequential ramp runs olive to lime; a zero
   is drawn in distrust orange because a zero is a failure, not a low score.
   Absent data is an empty well cell, never a zero. */
export function Heatmap({ columns = [], rows = [], warnColumn }) {
  const fill = v => {
    if (v == null) return "var(--well)";
    if (v === 0) return "var(--scale-0)";
    if (v >= 100) return "var(--scale-6)";
    if (v >= 96) return "var(--scale-5)";
    if (v >= 90) return "var(--scale-4)";
    if (v >= 75) return "var(--scale-3)";
    if (v >= 60) return "var(--scale-2)";
    return "var(--scale-1)";
  };
  /* Light ink only survives on the two darkest olives; everything brighter,
     including the orange zero, takes canvas-dark text. */
  const ink = v => (v == null ? "var(--ink)" : v === 0 || v >= 75 ? "var(--canvas)" : "var(--ink)");
  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "150px repeat(" + columns.length + ",1fr)", gap: "4px", minWidth: 520 }}>
        <span />
        {columns.map(c => (
          <span key={c} style={{ fontFamily: "var(--mono)", fontSize: "var(--label-size)", color: c === warnColumn ? "var(--accent-distrust)" : "var(--ink-4)", textAlign: "center" }}>{c}</span>
        ))}
        {rows.map(r => (
          <React.Fragment key={r.label}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "12px", alignSelf: "center" }}>{r.label}</span>
            {columns.map(c => {
              const v = r.values[c];
              return (
                <span key={c} title={v == null ? r.label + " · " + c + " · no data yet" : r.label + " · " + c + " · " + v}
                  style={{ background: fill(v), height: "var(--heat-cell-h)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: "11px", color: ink(v) }}>
                  {v == null ? "" : v}
                </span>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

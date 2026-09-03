import React from "react";

/* Ranked rows: hairline separators, mono throughout, and an optional unranked
   row pinned below the ranking with the reason in the footer. In-progress and
   unrankable are designed states, never blanks. */
export function Standings({ rows = [], unranked = [], footer, meta }) {
  const cols = "22px 1fr 96px";
  const cell = { padding: "var(--cell-pad)", fontFamily: "var(--mono)", fontSize: "13px" };
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: "10px", padding: "10px 18px", fontFamily: "var(--mono)", fontSize: "var(--label-size)", letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-3)", borderBottom: "var(--border)" }}>
        <span>#</span><span>model</span><span style={{ textAlign: "right" }}>{meta || "score"}</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.label} style={{ ...cell, display: "grid", gridTemplateColumns: cols, gap: "10px", borderBottom: i === rows.length - 1 && !unranked.length ? 0 : "1px solid #12151a" }}>
          <span style={{ color: r.leader ? "var(--accent-leader)" : "var(--ink-3)" }}>{String(i + 1).padStart(2, "0")}</span>
          <span>{r.label}</span>
          <span style={{ textAlign: "right" }}>{r.score}</span>
        </div>
      ))}
      {unranked.map(r => (
        <div key={r.label} style={{ ...cell, display: "grid", gridTemplateColumns: cols, gap: "10px", borderTop: "var(--border)", color: "var(--ink-3)" }}>
          <span style={{ color: "var(--accent-distrust)" }}>—</span>
          <span>{r.label}</span>
          <span style={{ textAlign: "right" }}>{r.score}</span>
        </div>
      ))}
      {footer && <div style={{ borderTop: "var(--border)", padding: "var(--panel-foot-pad)", fontFamily: "var(--mono)", fontSize: "var(--caption-size)", color: "var(--ink-3)", lineHeight: 1.7 }}>{footer}</div>}
    </div>
  );
}

import React from "react";

/* One of the three skills, as an equal panel: eyebrow, plain-language question,
   one sentence of method, its own small chart, and a caption naming the colours. */
export function TrackPanel({ index, status, statusTone = "brand", question, method, chart, caption }) {
  const statusColor = statusTone === "brand" ? "var(--accent-brand)" : statusTone === "quiet" ? "var(--ink-3)" : "var(--ink)";
  return (
    <div style={{ background: "var(--surface)", padding: "var(--track-pad)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: "var(--label-size)", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--accent-brand)" }}>{"skill " + index}</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: "var(--label-size)", color: statusColor }}>{status}</span>
      </div>
      <div style={{ fontFamily: "var(--display)", fontSize: "var(--h3-size)", fontWeight: 800, letterSpacing: "-.025em", marginTop: "10px" }}>{question}</div>
      <p style={{ fontSize: "14px", fontWeight: 200, color: "var(--ink-4)", marginTop: "6px" }}>{method}</p>
      {chart}
      {caption && <div style={{ fontFamily: "var(--mono)", fontSize: "var(--label-size)", color: "var(--ink-3)", marginTop: "8px" }}>{caption}</div>}
    </div>
  );
}

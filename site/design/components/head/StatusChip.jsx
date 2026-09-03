import React from "react";

/* Mono status chip. Brand lime for live states, ink for human-in-the-loop,
   ink-3 for not-yet, distrust orange for warnings. */
export function StatusChip({ children, tone = "brand" }) {
  const color = tone === "brand" ? "var(--accent-brand)" : tone === "warn" ? "var(--accent-distrust)" : tone === "quiet" ? "var(--ink-3)" : "var(--ink)";
  return <span style={{ fontFamily: "var(--mono)", fontSize: "var(--label-size)", color }}>{children}</span>;
}

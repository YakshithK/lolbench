import React from "react";

/* Rank cell. Tier leaders get the lime chip; everyone else is a quiet mono
   numeral; an unrankable row gets an orange dash instead of a number. */
export function RankChip({ rank, leader = false }) {
  if (rank == null) return <span style={{ fontFamily: "var(--mono)", color: "var(--accent-distrust)" }}>—</span>;
  const str = String(rank).padStart(2, "0");
  return <span style={{ fontFamily: "var(--mono)", fontSize: "13px", color: leader ? "var(--accent-leader)" : "var(--ink-3)" }}>{str}</span>;
}

import React from "react";

/* A score and the range it could really be in. The range is always orange and
   always present: a score without one does not ship. */
export function ScoreCell({ value, plusMinus, on }) {
  return (
    <span style={{ fontFamily: "var(--mono)", fontSize: "13px", fontVariantNumeric: "tabular-nums" }}>
      {value.toFixed(1)}{" "}
      {plusMinus != null && <span style={{ color: "var(--accent-distrust)", fontSize: "var(--caption-size)" }}>{"±" + plusMinus.toFixed(1)}</span>}
      {on != null && <span style={{ color: "var(--accent-distrust)", fontSize: "var(--caption-size)" }}>{"on " + on}</span>}
    </span>
  );
}

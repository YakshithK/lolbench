import React from "react";

/* Post-ballot disclosure. Hidden until a vote lands, then announced politely.
   Model names come in lime because the reveal is the payoff, not a datum. */
export function Reveal({ open, children }) {
  return (
    <div aria-live="polite" style={{ display: open ? "block" : "none", borderTop: "var(--border)", background: "var(--surface)", padding: "var(--panel-foot-pad)", fontFamily: "var(--mono)", fontSize: "var(--caption-size)", color: "var(--ink-2)", lineHeight: 1.7 }}>
      {open ? children : null}
    </div>
  );
}

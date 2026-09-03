import React from "react";

/* Brand-lime eyebrow above the headline. One per page. */
export function Kicker({ children }) {
  return <div style={{ fontFamily: "var(--mono)", fontSize: "var(--caption-size)", letterSpacing: "var(--kicker-tracking)", textTransform: "uppercase", color: "var(--accent-brand)" }}>{children}</div>;
}

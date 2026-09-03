import React from "react";

/* The punchline paragraph: Sora 200 at 22px, 40 to 52 characters wide. */
export function Lede({ children, measure = "40ch" }) {
  return <p style={{ marginTop: "22px", fontFamily: "var(--body)", fontSize: "var(--sub-size)", fontWeight: 200, color: "var(--ink-2)", maxWidth: measure }}>{children}</p>;
}

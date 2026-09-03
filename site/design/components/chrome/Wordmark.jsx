import React from "react";
import { Mark } from "./Mark.jsx";

/* Primary lockup: mark + "LOL BENCH" in mono 700. The mark's height matches the
   wordmark's cap height. */
export function Wordmark({ href = "/", size = 14, showMark = true }) {
  const Tag = href ? "a" : "span";
  return (
    <Tag href={href || undefined} style={{ display: "inline-flex", alignItems: "center", gap: "9px", textDecoration: "none", color: "var(--ink)" }}>
      {showMark && <Mark width={size * 1.85} />}
      <span style={{ fontFamily: "var(--mono)", fontWeight: 700, fontSize: size + "px", letterSpacing: "-.02em" }}>LOL BENCH</span>
    </Tag>
  );
}

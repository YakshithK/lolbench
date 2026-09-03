import React from "react";

/* The LOL Bench mark: an error bar with its ends turned up. The caps are the
   interval, the curve is the mouth. Minimum width 20px; below that use the
   wordmark alone. */
export function Mark({ width = 26, color = "var(--accent-brand)", title = "LOL Bench" }) {
  return (
    <svg width={width} height={width * (17 / 26)} viewBox="0 0 72 44" role="img" aria-label={title} style={{ display: "block", flex: "none" }}>
      <path d="M10 12 Q36 40 62 12" fill="none" stroke={color} strokeWidth="8" />
      <line x1="10" y1="1" x2="10" y2="14" stroke={color} strokeWidth="8" />
      <line x1="62" y1="1" x2="62" y2="14" stroke={color} strokeWidth="8" />
    </svg>
  );
}

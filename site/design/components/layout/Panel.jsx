import React from "react";

/* The only container: hairline outline on the glass surface, with a header row
   (display-face title left, mono meta right) and an optional caption strip.
   The caption is where a chart is explained; it is never optional in practice. */
export function Panel({ title, meta, children, caption, pad = true, size = "md" }) {
  const titleSize = size === "lg" ? "var(--h2-size)" : "var(--h4-size)";
  const titleWeight = size === "lg" ? 800 : 700;
  return (
    <div style={{ border: "var(--border)", background: "var(--surface-glass)" }}>
      {(title || meta) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px", padding: "var(--panel-head-pad)", borderBottom: "var(--border)" }}>
          <h2 style={{ fontFamily: "var(--display)", fontWeight: titleWeight, fontSize: titleSize, letterSpacing: "-.025em" }}>{title}</h2>
          {meta && <span style={{ fontFamily: "var(--mono)", fontSize: "var(--caption-size)", color: "var(--ink-3)", textAlign: "right" }}>{meta}</span>}
        </div>
      )}
      <div style={{ padding: pad ? "var(--panel-body-pad)" : 0 }}>{children}</div>
      {caption && (
        <div style={{ borderTop: "var(--border)", padding: "var(--panel-foot-pad)", fontFamily: "var(--mono)", fontSize: "var(--caption-size)", color: "var(--ink-3)", lineHeight: 1.7 }}>{caption}</div>
      )}
    </div>
  );
}

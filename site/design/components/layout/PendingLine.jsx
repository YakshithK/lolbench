import React from "react";

/* The dashed "nothing here yet" block, and the only dashed border in the system.
   It replaces a table entirely rather than sitting above an empty one. */
export function PendingLine({ lead, children, center = false }) {
  return (
    <div style={{ border: "1px dashed var(--rule-2)", padding: "20px", background: "var(--surface)", textAlign: center ? "center" : "left" }}>
      {lead && <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "17px" }}>{lead}</div>}
      <p style={{ fontSize: "14px", fontWeight: 200, color: "var(--ink-4)", marginTop: "6px" }}>{children}</p>
    </div>
  );
}

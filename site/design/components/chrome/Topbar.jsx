import React from "react";
import { Wordmark } from "./Wordmark.jsx";

/* 56px bar closed by a hairline. Lockup left, mono nav centre, provenance stamp
   right. The stamp is disclosure, not decoration. */
export function Topbar({ nav = [], current, stamp }) {
  return (
    <div style={{ borderBottom: "var(--border)", background: "var(--canvas)" }}>
      <div className="wrap" style={{ height: "var(--topbar-h)", display: "flex", alignItems: "center", gap: "32px" }}>
        <Wordmark />
        <nav style={{ display: "flex", gap: "24px", fontFamily: "var(--mono)", fontSize: "12px" }}>
          {nav.map(item => {
            const on = item.label === current;
            return (
              <a key={item.label} href={item.href || "#"} onClick={item.onClick} aria-current={on ? "page" : undefined}
                style={{ color: on ? "var(--ink)" : "var(--ink-4)", textDecoration: "none", paddingBottom: "3px", borderBottom: on ? "1px solid var(--accent-brand)" : "1px solid transparent", cursor: "pointer" }}>
                {item.label}
              </a>
            );
          })}
        </nav>
        {stamp && <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", fontSize: "var(--stamp-size)", color: "var(--ink-3)" }}>{stamp}</span>}
      </div>
    </div>
  );
}

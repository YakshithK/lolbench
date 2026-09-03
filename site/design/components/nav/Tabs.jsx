import React from "react";

/* View switcher for one dataset: plot, table, vote. Selected tab is a lime fill
   with canvas text; the rest are quiet mono on the hairline frame. */
export function Tabs({ tabs = [], value, onChange, label = "Views" }) {
  return (
    <div role="tablist" aria-label={label} style={{ display: "flex", border: "var(--border)" }}>
      {tabs.map((t, i) => {
        const on = t.id === value;
        return (
          <button key={t.id} role="tab" aria-selected={on} aria-controls={t.id} onClick={() => onChange && onChange(t.id)}
            style={{ fontFamily: "var(--mono)", fontSize: "12px", padding: "9px 15px", cursor: "pointer", border: 0,
              borderLeft: i ? "var(--border)" : 0, background: on ? "var(--accent-brand)" : "transparent",
              color: on ? "var(--canvas)" : "var(--ink-4)", fontWeight: on ? 600 : 400, transition: "background var(--motion-state),color var(--motion-state)" }}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

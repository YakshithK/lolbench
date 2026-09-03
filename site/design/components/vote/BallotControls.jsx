import React from "react";

/* Three equal cells on the panel's bottom edge. Hover raises contrast to ink,
   press raises it again to brand lime. 44px minimum height. */
export function BallotControls({ onVote, options = [{ id: "A", label: "a" }, { id: "B", label: "b" }, { id: "tie", label: "neither" }] }) {
  const [hot, setHot] = React.useState(null);
  const [down, setDown] = React.useState(null);
  return (
    <div role="group" aria-label="Ballot" style={{ display: "grid", gridTemplateColumns: "repeat(" + options.length + ",1fr)", borderTop: "var(--border)" }}>
      {options.map((o, i) => {
        const pressed = down === o.id, over = hot === o.id;
        return (
          <button key={o.id} onClick={() => onVote && onVote(o.id)}
            onMouseEnter={() => setHot(o.id)} onMouseLeave={() => { setHot(null); setDown(null); }}
            onMouseDown={() => setDown(o.id)} onMouseUp={() => setDown(null)}
            style={{ fontFamily: "var(--mono)", fontSize: "13px", padding: "15px 6px", cursor: "pointer", border: 0,
              borderLeft: i ? "var(--border)" : 0,
              background: pressed ? "var(--accent-brand)" : "transparent",
              color: pressed ? "var(--canvas)" : over ? "var(--ink)" : "var(--ink-4)",
              transition: "background var(--motion-state),color var(--motion-state)" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

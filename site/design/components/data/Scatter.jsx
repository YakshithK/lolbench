import React from "react";

/* Score against cost. Dots are models, the vertical orange bar is the range the
   score could really be in.

   Two rules learned the hard way:
   1. The y-axis is derived from the data, never clamped. An interval that runs to
      25 must be drawn to 25, or a reader cannot tell it from one that stops at 70.
   2. Labels do NOT live in the plot. Several models sit on the free axis and their
      bars cover most of the plot height, so in-plot text is always struck through
      by some other model's interval. The labels are a legend gutter instead, in
      chart order, each carrying the score and the cost. */
export function Scatter({ points = [], xMax = 2, yMin, yMax = 100, freeCut = 0.07, rule, label = "Score against cost", legend = true }) {
  const lo0 = points.length ? Math.min(...points.map(p => p.lo)) : 70;
  const floor = yMin != null ? yMin : Math.max(0, Math.floor((lo0 - 4) / 10) * 10);
  const X = v => 56 + (Math.min(v, xMax) / xMax) * 728;
  const Y = v => 380 - ((Math.max(floor, Math.min(yMax, v)) - floor) / (yMax - floor)) * 322;
  const ticks = [0, 1, 2, 3].map(i => Math.round(floor + (i * (yMax - floor)) / 3));
  const swatch = p => (p.leader ? "var(--accent-leader)" : p.x > 0 ? "var(--ink)" : "var(--ink-mute)");
  const ordered = [...points].sort((a, b) => b.y - a.y);
  return (
    <div>
      <svg viewBox="0 0 800 440" role="img" aria-label={label} style={{ display: "block", width: "100%", height: "auto" }}>
        <line x1="56" y1="40" x2="56" y2="380" stroke="var(--rule-2)" />
        <line x1="56" y1="380" x2="784" y2="380" stroke="var(--rule-2)" />
        {ticks.map(v => (
          <g key={v}>
            <line x1="56" y1={Y(v)} x2="784" y2={Y(v)} stroke="var(--well)" />
            <text x="46" y={Y(v) + 4} textAnchor="end" fill="var(--ink-3)" fontFamily="Azeret Mono, monospace" fontSize="10">{v}</text>
          </g>
        ))}
        <line x1={X(freeCut * xMax)} y1="40" x2={X(freeCut * xMax)} y2="380" stroke="var(--rule-2)" strokeDasharray="2 5" />
        <text x={X(freeCut * xMax) + 8} y="376" fill="var(--ink-3)" fontFamily="Azeret Mono, monospace" fontSize="10">paid →</text>
        <text x="56" y="402" textAnchor="middle" fill="var(--ink-3)" fontFamily="Azeret Mono, monospace" fontSize="10">free</text>
        <text x="784" y="402" textAnchor="end" fill="var(--ink-3)" fontFamily="Azeret Mono, monospace" fontSize="10">{"$" + xMax.toFixed(2)}</text>
        <text x="56" y="426" fill="var(--ink-4)" fontFamily="Azeret Mono, monospace" fontSize="10">what it cost to run the whole set →</text>
        {rule && (
          <g>
            <line x1="270" y1={Y(rule.at)} x2="430" y2={Y(rule.at)} stroke="var(--accent-leader)" strokeDasharray="3 6" opacity=".5" />
            <text x="270" y="32" fill="var(--accent-leader)" fontFamily="Azeret Mono, monospace" fontSize="10">{rule.label}</text>
          </g>
        )}
        {points.map(p => {
          const cx = X(p.x);
          return (
            <g key={p.label}>
              <line x1={cx} y1={Y(p.hi)} x2={cx} y2={Y(p.lo)} stroke="var(--accent-distrust)" strokeWidth="2" opacity={p.thin ? .55 : 1} />
              <circle cx={cx} cy={Y(p.y)} r="5.5" fill={swatch(p)}>
                <title>{p.label + " · " + p.y.toFixed(1) + " · range " + p.lo.toFixed(1) + " to " + p.hi.toFixed(1) + " · " + (p.x ? "$" + p.x.toFixed(2) : "free")}</title>
              </circle>
            </g>
          );
        })}
      </svg>
      {legend && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "8px 20px", padding: "16px 18px 4px" }}>
          {ordered.map(p => (
            <div key={p.label} style={{ display: "flex", alignItems: "baseline", gap: "8px", fontFamily: "var(--mono)", fontSize: "var(--caption-size)" }}>
              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: swatch(p), flex: "none", transform: "translateY(-1px)" }} />
              <span style={{ color: p.leader ? "var(--accent-leader)" : "var(--ink-2)" }}>{p.label}</span>
              <span style={{ color: "var(--ink)", marginLeft: "auto" }}>{p.y.toFixed(1)}</span>
              <span style={{ color: "var(--accent-distrust)" }}>{"±" + ((p.hi - p.lo) / 2).toFixed(1)}</span>
              <span style={{ color: "var(--ink-3)", minWidth: "42px", textAlign: "right" }}>{p.x ? "$" + p.x.toFixed(2) : "free"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

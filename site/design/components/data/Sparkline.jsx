import React from "react";

/* Track summary bars, one per model, tallest first. Lime for a tier leader,
   orange for a sample too thin to trust, neutral for the rest, and well-coloured
   stubs for models still being judged. */
export function Sparkline({ bars = [], pending = 0, min = 70, max = 100, label = "Track summary" }) {
  const n = bars.length + pending;
  const w = n ? Math.max(6, Math.floor(360 / n) - 4) : 20;
  const step = w + 4;
  const h = v => Math.max(2, ((Math.max(min, Math.min(max, v)) - min) / (max - min)) * 36);
  return (
    <svg viewBox="0 0 360 56" role="img" aria-label={label} style={{ display: "block", width: "100%", marginTop: "14px" }}>
      <line x1="0" y1="46" x2="360" y2="46" stroke="var(--rule-2)" />
      {bars.map((b, i) => (
        <rect key={b.label} x={i * step} y={46 - h(b.value)} width={w} height={h(b.value)}
          fill={b.thin ? "var(--accent-distrust)" : b.leader ? "var(--accent-leader)" : "var(--ink-2)"}>
          <title>{b.label + " · " + b.value}</title>
        </rect>
      ))}
      {Array.from({ length: pending }, (_, i) => (
        <rect key={"p" + i} x={(bars.length + i) * step} y="42" width={w} height="4" fill="var(--rule-2)" />
      ))}
    </svg>
  );
}

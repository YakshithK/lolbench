const { TrackPanel, Sparkline } = window.LOLBenchDesignSystem_ab2c27;

/* Track 02's real question is "does its joke win", not "did it write enough".
   A bar with a range drawn above it: the fill is the win rate, the orange
   whisker is the 95% Wilson interval. Drawn rather than printed so the
   uncertainty is the first thing you see, and printed too so the number
   travels without the chart. */
function WinRateChart({ rows = [], limit = 0, minDecisions = 0 }) {
  const eligible = minDecisions ? rows.filter(r => r.n >= minDecisions) : rows;
  if (!eligible.length) {
    return <div style={{ height: "56px", marginTop: "14px", border: "1px dashed var(--rule-2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--ink-3)" }}>not enough ballots yet</div>;
  }
  const shown = limit ? eligible.slice(0, limit) : eligible;
  const top = eligible[0].label;
  return (
    <div style={{ display: "grid", gap: "9px", marginTop: "14px" }}>
      {shown.map(r => {
        const fill = r.label === top ? "var(--accent-leader)" : r.thin ? "var(--accent-distrust)" : "var(--ink-2)";
        return (
          <div key={r.label} style={{ display: "grid", gridTemplateColumns: "108px 1fr 62px", gap: "8px", alignItems: "center" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: "10px", color: r.thin ? "var(--ink-4)" : "var(--ink-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>
            <div>
              <div style={{ position: "relative", height: "3px" }}>
                <i style={{ position: "absolute", left: r.lo + "%", width: Math.max(2, r.hi - r.lo) + "%", top: 0, height: "3px", background: "var(--accent-distrust)" }} />
              </div>
              <div style={{ height: "var(--bar-h)", background: "var(--well)", marginTop: "2px" }}>
                <i style={{ display: "block", height: "100%", width: r.value + "%", background: fill }} />
              </div>
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", textAlign: "right", color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
              {r.value.toFixed(0) + "%"}
              <span style={{ color: "var(--accent-distrust)", fontSize: "10px" }}>{" ±" + Math.round((r.hi - r.lo) / 2)}</span>
              <span style={{ display: "block", color: "var(--ink-4)", fontSize: "9px", letterSpacing: ".08em" }}>{"ON " + r.n}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Tracks({ data }) {
  // Adapted from the design system's prototype wiring: the prototype assumed
  // there was always at least one unrankable (n<10) model. The full run has
  // finished and every model cleared n>=10, so that assumption no longer
  // holds — guard it instead of indexing into an empty array.
  const bars = [
    ...data.unrankable.map(m => ({ label: m.name, value: m.y, thin: true })),
    ...data.scored.map(m => ({ label: m.name, value: m.y, leader: m.leader, thin: m.thin }))
  ];
  const writtenTarget = 40; // real wave-0 premise count (docs/02), not the prototype's placeholder 348
  const scoredStatus = data.pending > 0
    ? `${data.scored.length} of ${data.scored.length + data.pending} scored`
    : `${data.scored.length} of ${data.scored.length} scored`;
  // Status and caption for the win-rate panel. The panel answers "does its joke
  // win", so every number in it is a ballot count, and the ties-are-dropped
  // rule is stated rather than buried: it moves the rate by a few points and a
  // reader comparing models deserves to know which convention produced it.
  const wr = data.winrate || [];
  const decisive = data.voteTotals ? data.voteTotals.decisive : Math.round(wr.reduce((s, r) => s + r.n, 0) / 2);
  const placeable = wr.filter(r => r.n >= 20).length;
  const winStatus = wr.length ? `${decisive.toLocaleString()} ballots counted` : "you are the judge";
  const winCaption = wr.length
    ? `how often a human picked this model's joke, of ${decisive.toLocaleString()} decisive ballots · ties and "neither" are not counted · ${placeable} of ${wr.length} models have enough ballots to place · the rest are in the sidebar`
    : "no ballots yet · two models write on the same setup, you pick the funnier one";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "var(--rule)", border: "var(--border)", marginTop: "30px" }}>
      <TrackPanel index="01" status={scoredStatus} question="Does it get the joke?"
        method="It explains why a joke works. We check that against notes a human wrote."
        chart={<Sparkline bars={bars} pending={data.pending} />}
        caption="one bar per model, best first · lime = best score on the board · orange = too thin to trust · dark = still being judged" />
      <TrackPanel index="02" status={winStatus} statusTone="ink" question="Can it land one?"
        method="Two models write on the same setup. Humans pick the funnier line, blind."
        chart={<WinRateChart rows={data.winrate} minDecisions={20} />}
        caption={winCaption} />
      <TrackPanel index="03" status="next data drop" statusTone="quiet" question="Does it laugh with us?"
        method="It ranks 1,500 jokes best to worst. We compare its ranking to ours."
        chart={<div style={{ height: "56px", marginTop: "14px", border: "1px dashed var(--rule-2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--ink-3)" }}>no data yet</div>}
        caption="cheapest skill to test · no benchmark covers it" />
    </div>
  );
}
Object.assign(window, { Tracks, WinRateChart });

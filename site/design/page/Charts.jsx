const { Panel, Scatter, Heatmap } = window.LOLBenchDesignSystem_ab2c27;

function Charts({ data }) {
  const points = data.scored.map(m => ({ label: m.name, x: m.x, y: m.y, lo: m.lo, hi: m.hi, leader: m.leader, thin: m.thin }));
  const bestOnBoard = [...data.scored].sort((a, b) => b.y - a.y)[0];
  const cheapestSpend = Math.min(...data.scored.map(m => m.x));
  const cheapestGood = data.scored.filter(m => m.x === cheapestSpend).sort((a, b) => b.y - a.y)[0];
  const scatterCaption = bestOnBoard
    ? `The best score on the board is ${bestOnBoard.name} at ${bestOnBoard.y.toFixed(1)} for an estimated $${bestOnBoard.x.toFixed(2)}.`
      + (cheapestGood && cheapestGood.name !== bestOnBoard.name ? ` The cheapest model to run, ${cheapestGood.name} at $${cheapestGood.x.toFixed(2)}, still reaches ${cheapestGood.y.toFixed(1)}.` : "")
      + ` Every figure here is estimated from output length and a per-model price table, not billed per call — none of these providers' current "free tier" deals mean the model itself costs nothing to run.`
    : "Cost data isn't available yet for any scored model.";

  const f6 = data.mechanismRows.map(r => ({ label: r.label, v: r.values.F6 })).filter(r => r.v != null);
  const f6Sorted = [...f6].sort((a, b) => a.v - b.v);
  const f6Worst = f6Sorted[0];
  const f6Best = f6Sorted[f6Sorted.length - 1];
  // F1-F5 ask a model to explain a joke whose mechanism is already visible in
  // the text; every model, cheap or frontier, finds it, so these five columns
  // barely separate anyone. Computed live (not hardcoded) so this note stays
  // honest as the roster and scores change - if a future model pool actually
  // spreads out on F1-F5, this line should shrink or disappear on its own.
  const otherSpreads = data.mechanisms.filter(f => f !== "F6").map(f => {
    const vals = data.mechanismRows.map(r => r.values[f]).filter(v => v != null);
    return vals.length ? Math.max(...vals) - Math.min(...vals) : null;
  }).filter(v => v != null);
  const maxOtherSpread = otherSpreads.length ? Math.max(...otherSpreads) : null;
  const heatCaption = f6.length
    ? <>Every model scored on F6 lands lowest on that column, from {f6Worst && f6Worst.label + " (" + f6Worst.v + ")"} to {f6Best && f6Best.label + " (" + f6Best.v + ")"}. Dark cells mean that model hasn't been given jokes of that kind yet.{" "}
        {maxOtherSpread != null ? <>The other five families barely separate models at all — no more than {maxOtherSpread} points between the best and worst score on any of them. That's a ceiling, not a strength: F1-F5 ask a model to explain a joke whose mechanism is already visible in the text, which every model manages. We're redesigning them to require real judgment, the way F6 already does.</> : null}
      </>
    : "Mechanism data lands as families get judged.";

  // "How much data is behind each number" moved to the sidebar (see
  // Sidebar.jsx): moving the vote panel out to its own full-width section
  // dropped the sidebar to 2 panels against this column's 3, leaving empty
  // space under the shorter column - the same imbalance the prior version of
  // this comment described, just recreated from the other direction. Moving
  // one panel across restores the 3-and-3 balance.
  return (
    <div style={{ display: "grid", gap: "26px" }}>
      <Panel size="lg" title="Score against cost" meta="dots are models · the orange bar is the range · lime = best score on the board" pad={false}
        caption={scatterCaption}>
        <Scatter points={points} xMax={Math.ceil((Math.max(0.5, ...points.map(p => p.x)) * 1.15) * 2) / 2}
          rule={bestOnBoard ? { at: bestOnBoard.y, label: `best score so far: ${bestOnBoard.y.toFixed(1)}` } : undefined} />
      </Panel>
      <Panel title="Which kinds of joke they miss" meta="the dataset sorts jokes into six mechanisms, F1 to F6"
        caption={heatCaption}>
        <Heatmap columns={data.mechanisms} warnColumn="F6" rows={data.mechanismRows} />
      </Panel>
    </div>
  );
}
Object.assign(window, { Charts });

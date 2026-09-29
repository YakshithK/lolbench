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
  // Per-family spread across models, computed live. Says which columns actually
  // separate models and which do not, without naming families that hold no
  // items. In v0.3 the answer is the interesting one: F6 is the only column
  // where the models visibly disagree with each other.
  const spreadOf = f => {
    const vals = data.mechanismRows.map(r => r.values[f]).filter(v => v != null);
    return vals.length ? Math.max(...vals) - Math.min(...vals) : null;
  };
  const spreads = data.mechanisms.map(f => ({ f, spread: spreadOf(f) })).filter(x => x.spread != null);
  const tightest = spreads.length ? spreads.reduce((a, b) => (a.spread <= b.spread ? a : b)) : null;
  const widest = spreads.length ? spreads.reduce((a, b) => (a.spread >= b.spread ? a : b)) : null;
  const f6Spread = spreadOf("F6");
  const heatCaption = f6.length
    ? <>
        T1 to T3 are real jokes people wrote, graded on whether the model can say why they work. F6 is the same task on jokes we know don't work, and it is the only column where the models separate: {f6Spread != null ? f6Spread + " points" : "a wide spread"} between the best and worst, against {tightest && tightest.f !== "F6" ? tightest.spread + " points" : "almost nothing"} on {tightest ? tightest.f : "the real-joke tiers"}.{" "}
        Dark cells mean that model hasn't been given jokes of that kind yet. Explaining a working joke is close to ceiling for every model here. Explaining a failed one is not, and that is the whole finding.
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
      <Panel title="Which kinds of joke they miss" meta="T1 to T3 are jokes that work, F6 are jokes that don't"
        caption={heatCaption}>
        <Heatmap columns={data.mechanisms} warnColumn="F6" rows={data.mechanismRows} />
      </Panel>
    </div>
  );
}
Object.assign(window, { Charts });

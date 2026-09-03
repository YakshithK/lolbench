const { Panel, Scatter, Heatmap, DotMatrix, BarList } = window.LOLBenchDesignSystem_ab2c27;

function Charts({ data }) {
  // Only models with a real logged cost go on the cost axis — five models ran
  // before cost-tracking existed and have no true number, so they're excluded
  // here rather than shown as $0 (which would misreport them as free tier).
  const withCost = data.scored.filter(m => typeof m.x === "number");
  const points = withCost.map(m => ({ label: m.name, x: m.x, y: m.y, lo: m.lo, hi: m.hi, leader: m.leader, thin: m.thin }));
  const bestOnBoard = [...withCost].sort((a, b) => b.y - a.y)[0];
  const cheapestGood = [...withCost].filter(m => m.x === 0).sort((a, b) => b.y - a.y)[0];
  const scatterCaption = bestOnBoard
    ? `Among the ${withCost.length} models with a real logged cost, the best score is ${bestOnBoard.name} at ${bestOnBoard.y.toFixed(1)} for $${bestOnBoard.x.toFixed(2)}.`
      + (cheapestGood ? ` The best free model, ${cheapestGood.name}, reaches ${cheapestGood.y.toFixed(1)} for nothing.` : "")
      + (data.excludedFromCost.length ? ` ${data.excludedFromCost.length} more models aren't plotted here: their runs predate cost-tracking, so no real number exists for them.` : "")
    : "Cost data isn't available yet for any scored model.";

  const matrixSource = [...data.scored, ...data.unrankable];
  const matrix = [...matrixSource].sort((a, b) => b.n - a.n).slice(0, 6).map(m => ({ label: m.name, n: m.n }));

  const f6 = data.mechanismRows.map(r => ({ label: r.label, v: r.values.F6 })).filter(r => r.v != null);
  const f6Sorted = [...f6].sort((a, b) => a.v - b.v);
  const f6Worst = f6Sorted[0];
  const f6Best = f6Sorted[f6Sorted.length - 1];
  const heatCaption = f6.length
    ? <>Every model scored on F6 lands lowest on that column, from {f6Worst && f6Worst.label + " (" + f6Worst.v + ")"} to {f6Best && f6Best.label + " (" + f6Best.v + ")"} — none has cracked the 90s that every model reaches on the other five. Dark cells mean that model hasn't been given jokes of that kind yet.</>
    : "Mechanism data lands as families get judged.";

  const writtenTarget = 40;
  const totalCount = data.scored.length + data.unrankable.length;

  return (
    <div style={{ display: "grid", gap: "26px" }}>
      <Panel size="lg" title="Score against cost" meta="dots are models · the orange bar is the range · lime = best in its price tier" pad={false}
        caption={scatterCaption}>
        <Scatter points={points} xMax={Math.max(1, ...points.map(p => p.x)) * 1.15 || 2}
          rule={bestOnBoard ? { at: bestOnBoard.y, label: `best confirmed-cost score so far: ${bestOnBoard.y.toFixed(1)}` } : undefined} />
      </Panel>
      <Panel title="How much data is behind each number" meta="one square = 10 graded answers · partial square = fewer than 10"
        caption={`Shown: the ${matrix.length} models with the most graded answers so far, out of ${totalCount} total. Orange means the sample is too thin to trust.`}>
        <DotMatrix rows={matrix} />
      </Panel>
      <Panel title="Which kinds of joke they miss" meta="the dataset sorts jokes into six mechanisms, F1 to F6"
        caption={heatCaption}>
        <Heatmap columns={data.mechanisms} warnColumn="F6" rows={data.mechanismRows} />
      </Panel>
      <Panel title="Who has written their jokes" meta={`jokes written of ${writtenTarget}`}
        caption={`${writtenTarget} jokes each is a full wave-0 set. Counts below are non-empty jokes actually produced, not attempts.`}>
        <BarList target={writtenTarget} rows={data.written} />
      </Panel>
    </div>
  );
}
Object.assign(window, { Charts });

const { Panel, Standings, ScoreCell, Bout, BallotControls, Reveal, StatusChip, BarList, DotMatrix } = window.LOLBenchDesignSystem_ab2c27;
const WRITTEN_TARGET = 40;

function VotePanel({ bouts }) {
  const [i, setI] = React.useState(0);
  const [ballot, setBallot] = React.useState(null);
  const bout = bouts[i % bouts.length];
  const cast = id => {
    if (ballot) return;
    setBallot(id);
    // BallotControls' click ids ("A"/"B"/"tie") and the keydown handler's ids
    // ("a"/"b"/"neither") differ in case - normalize before matching, or every
    // mouse click (the id casing that never matched "a"/"b") silently records
    // as "tie" while only keyboard voting works correctly.
    const key = String(id).toLowerCase();
    fetch("/api/vote", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchup_id: bout.id, premise_id: bout.premise, model_a: bout.modelA, model_b: bout.modelB,
        winner: key === "a" ? "A" : key === "b" ? "B" : "tie"
      })
    }).catch(() => {});
    window.setTimeout(() => { setBallot(null); setI(n => n + 1); }, 2800);
  };
  React.useEffect(() => {
    const onKey = e => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;
      const k = e.key.toLowerCase();
      if (k === "a") cast("a"); else if (k === "b") cast("b"); else if (k === "t") cast("neither");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
  return (
    <div id="vote-panel">
      <Panel title="Which one is funnier?" meta={<StatusChip tone="ink">authors hidden</StatusChip>} pad={false}>
        <Bout key={bout.id} a={bout.a} b={bout.b} />
        <BallotControls onVote={cast} />
        <Reveal open={!!ballot}>
          {ballot ? <>
            Ballot to {ballot}. Panel a was <b style={{ color: "var(--accent-brand)" }}>{bout.modelA}</b>, panel b was <b style={{ color: "var(--accent-brand)" }}>{bout.modelB}</b>.{" "}
            {bout.ballots ? "Ballots on this pair to date: " + bout.ballots + "." : "Yours is the first ballot that touches these two."} Authors re-conceal for the next voter.
          </> : null}
        </Reveal>
        <div style={{ borderTop: "var(--border)", padding: "var(--panel-foot-pad)", fontFamily: "var(--mono)", fontSize: "var(--caption-size)", color: "var(--ink-3)" }}>
          {bout.id + " · premise " + bout.premise + " · " + bout.ballots + " ballots on this pair"}
        </div>
      </Panel>
    </div>
  );
}

function Sidebar({ data }) {
  // Adapted: the prototype's footer sentence assumed exactly one unrankable
  // model always existed. Every currently-enabled candidate cleared n>=10, so
  // that footer only appears when there's actually something to disclose.
  const footerParts = [];
  data.unrankable.forEach(m => {
    footerParts.push(`${m.name} scored ${m.y.toFixed(1)} on ${m.n} answer${m.n === 1 ? "" : "s"}: too thin to rank, so it sits outside the table.`);
  });
  if (data.pending > 0) footerParts.push(`${data.pending} more model${data.pending === 1 ? "" : "s"} still being judged.`);

  const matrixSource = [...data.scored, ...data.unrankable];
  const matrix = [...matrixSource].sort((a, b) => b.n - a.n).slice(0, 6).map(m => ({ label: m.name, n: m.n }));
  const totalCount = data.scored.length + data.unrankable.length;

  return (
    <div style={{ display: "grid", gap: "26px", alignContent: "start" }}>
      <Panel title="Standings" meta="lime = best score on the board" pad={false}>
        <Standings
          rows={data.scored.map(m => ({ label: m.name, leader: m.leader, score: <ScoreCell value={m.y} plusMinus={(m.hi - m.lo) / 2} /> }))}
          unranked={data.unrankable.map(m => ({ label: m.name, score: <ScoreCell value={m.y} on={m.n} /> }))}
          footer={footerParts.length ? footerParts.join(" ") : undefined}
        />
      </Panel>
      <Panel title="How much data is behind each number" meta="one square = 10 graded answers · partial square = fewer than 10"
        caption={`Shown: the ${matrix.length} models with the most graded answers so far, out of ${totalCount} total. Orange means the sample is too thin to trust.`}>
        <DotMatrix rows={matrix} />
      </Panel>
      <Panel title="Who has written their jokes" meta={`jokes written of ${WRITTEN_TARGET}`}
        caption={`${WRITTEN_TARGET} jokes each is a full wave-0 set. Counts below are non-empty jokes actually produced, not attempts.`}>
        <BarList target={WRITTEN_TARGET} rows={data.written} />
      </Panel>
    </div>
  );
}
Object.assign(window, { Sidebar, VotePanel });

const { Panel, Standings, ScoreCell, Bout, BallotControls, Reveal, StatusChip, BarList, DotMatrix } = window.LOLBenchDesignSystem_ab2c27;
const WRITTEN_TARGET = 40;

// Optional cohort question (NeuralNomad87's launch ask: global preference
// averages wash out the variance that actually differs between models - the
// same joke splits hard by audience). One-time pick, remembered locally,
// rides along with every ballot as a nullable column. Forward-only: old rows
// have no cohort, and per-cohort reads stay unpublished until any cohort
// clears the same n>=10 floor the rest of the board uses.
const COHORTS = [["very", "very online"], ["somewhat", "somewhat online"], ["rarely", "rarely online"]];
const COHORT_KEY = "lolb_cohort";

function VotePanel({ bouts }) {
  const [i, setI] = React.useState(0);
  const [ballot, setBallot] = React.useState(null);
  const [fb, setFb] = React.useState(null); // stage-2 follow-up: null | sending | done | error
  const [note, setNote] = React.useState("");
  const [cohort, setCohort] = React.useState(() => { try { return localStorage.getItem(COHORT_KEY) || ""; } catch (e) { return ""; } });
  const pickCohort = v => {
    setCohort(v);
    try { localStorage.setItem(COHORT_KEY, v); } catch (e) { /* private mode: rides on this page's votes only */ }
  };
  const adv = React.useRef(0);
  // Single choke point for moving on. The generation counter invalidates any
  // pending auto-advance timer, so a Send-triggered advance can't be followed
  // by a stale timer skipping a second bout.
  const advance = () => { adv.current += 1; setBallot(null); setFb(null); setNote(""); setI(n => n + 1); };
  const bout = bouts[i % bouts.length];
  const isProbe = bout.kind === "c";
  // ballot arrives as "A"/"B"/"tie"/"neither" (clicks) or "a"/"b"/"neither" (keys);
  // normalize once here so both the POST and the reveal read the same value.
  // "neither" is a DISTINCT stored outcome, not a tie: the voter found nothing
  // funny. Old "tie" rows stay ties (can't retro-split them) - see schema.sql.
  const wkey = ballot ? String(ballot).toLowerCase() : null;
  const w = !wkey ? null : wkey === "neither" ? "neither" : wkey === "a" ? "A" : wkey === "b" ? "B" : "tie";
  const cast = id => {
    if (ballot && ballot !== "error") return;
    // BallotControls' click ids ("A"/"B"/"neither") and the keydown handler's ids
    // ("a"/"b"/"neither") differ in case - normalize before matching, or every
    // mouse click (the id casing that never matched "a"/"b") silently records
    // as "tie" while only keyboard voting works correctly.
    const key = String(id).toLowerCase();
    const winner = key === "a" ? "A" : key === "b" ? "B" : key === "neither" ? "neither" : "tie";
    // Reveal ONLY on a confirmed write. The old code set the ballot first and
    // swallowed fetch errors, so a 409 (already voted) or 500 showed a success
    // reveal for a vote that never landed - silent data corruption plus a lie
    // to the voter. On failure we show an error and stay on the same bout.
    fetch("/api/vote", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isProbe ? {
        matchup_id: bout.id, premise_id: null, model_a: null, model_b: null,
        winner: winner, kind: "c", cohort: cohort || null
      } : {
        matchup_id: bout.id, premise_id: bout.premise, model_a: bout.modelA, model_b: bout.modelB,
        winner: winner, kind: "b", cohort: cohort || null
      })
    }).then(r => {
      if (!r.ok) throw new Error("vote rejected: " + r.status);
      setBallot(id);
      setFb(null); setNote("");
      // Neither ballots get a longer dwell so the voter has time for the
      // optional stage-2 follow-up. Guarded: a Send/Skip advance invalidates
      // this timer via the generation counter in advance().
      const my = adv.current;
      const dwell = String(id).toLowerCase() === "neither" ? 12000 : 2800;
      window.setTimeout(() => { if (adv.current === my) advance(); }, dwell);
    }).catch(() => { setBallot("error"); });
  };
  // Stage-2: optional WHY behind a neither. Fire-and-forget from the voter's
  // perspective - success shows thanks then advances, failure leaves Skip.
  const sendFeedback = reason => {
    if (fb === "sending" || fb === "done") return;
    setFb("sending");
    fetch("/api/feedback", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isProbe ? {
        matchup_id: bout.id, premise_id: null, model_a: null, model_b: null, kind: "c",
        reason: reason, note: note
      } : {
        matchup_id: bout.id, premise_id: bout.premise, model_a: bout.modelA, model_b: bout.modelB, kind: "b",
        reason: reason, note: note
      })
    }).then(r => {
      if (!r.ok) throw new Error("feedback rejected: " + r.status);
      setFb("done");
      window.setTimeout(() => advance(), 1500);
    }).catch(() => { setFb("error"); });
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
          {ballot === "error" ? <>Vote didn't record — connection hiccup or you already voted on this pair. Pick again to retry; you stay on this bout.</>
           : ballot ? (isProbe ? <>
             Ballot to {w === "neither" ? "neither — neither one got you" : w === "tie" ? "even" : w}. Both of these were real jokes written by humans, not models.{" "}
             {w === "neither"
               ? <>No verdict against the crowd on a neither — the Reddit crowd favorite was panel {bout.winner}.</>
               : w === "tie"
               ? <>You called it a tie — the Reddit crowd favorite was panel {bout.winner}.</>
               : (w === bout.winner
                 ? <>The Reddit crowd favorite was panel {bout.winner} — you agreed with the crowd.</>
                 : <>The Reddit crowd favorite was panel {bout.winner} — you disagreed with the crowd.</>)} {" "}
            {bout.ballots ? "Ballots on this pair to date: " + bout.ballots + "." : "Yours is the first ballot that touches these two."}
           </> : <>
             Ballot to {w === "neither" ? "neither — both left you cold" : ballot}. Panel a was <b style={{ color: "var(--accent-brand)" }}>{bout.modelA}</b>, panel b was <b style={{ color: "var(--accent-brand)" }}>{bout.modelB}</b>.{" "}
            {bout.ballots ? "Ballots on this pair to date: " + bout.ballots + "." : "Yours is the first ballot that touches these two."} Authors re-conceal for the next voter.
           </>) : null}
          {ballot && ballot !== "error" && w === "neither" && (fb === "done"
            ? <div style={{ borderTop: "var(--border)", padding: "10px var(--panel-foot-pad)", fontFamily: "var(--mono)", fontSize: "var(--caption-size)", color: "var(--ink-3)" }}>Noted — thanks, that's real data.</div>
            : <div style={{ borderTop: "var(--border)", padding: "10px var(--panel-foot-pad)", fontFamily: "var(--mono)", fontSize: "var(--caption-size)", color: "var(--ink-3)" }}>
              <div style={{ marginBottom: "8px" }}>optional: why neither?</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                {[["didnt-get", "didn't get it"], ["not-funny", "got it, wasn't funny"], ["both-terrible", "both were terrible"]].map(([rid, label]) => (
                  <button key={rid} disabled={fb === "sending"} onClick={() => sendFeedback(rid)}
                    style={{ fontFamily: "var(--mono)", fontSize: "var(--caption-size)", padding: "8px 10px", cursor: "pointer", border: "var(--border)", background: "transparent", color: "var(--ink-2)" }}>{label}</button>
                ))}
                <button disabled={fb === "sending"} onClick={() => advance()}
                  style={{ fontFamily: "var(--mono)", fontSize: "var(--caption-size)", padding: "8px 10px", cursor: "pointer", border: 0, background: "transparent", color: "var(--ink-4)" }}>skip</button>
              </div>
              <input value={note} onChange={e => setNote(e.target.value)} maxLength={500} placeholder="optional note (stored, never scored)"
                style={{ width: "100%", boxSizing: "border-box", fontFamily: "var(--mono)", fontSize: "var(--caption-size)", padding: "8px 10px", border: "var(--border)", background: "transparent", color: "var(--ink)" }} />
              {fb === "sending" ? <div style={{ marginTop: "6px" }}>sending…</div> : null}
              {fb === "error" ? <div style={{ marginTop: "6px" }}>didn't record — hit skip to move on.</div> : null}
            </div>)}
        </Reveal>
        <div style={{ borderTop: "var(--border)", padding: "var(--panel-foot-pad)", fontFamily: "var(--mono)", fontSize: "var(--caption-size)", color: "var(--ink-3)" }}>
          {cohort
            ? <span>voting as: {COHORTS.filter(c => c[0] === cohort).map(c => c[1])[0] || cohort}{" · "}<button onClick={() => pickCohort("")} style={{ fontFamily: "var(--mono)", fontSize: "var(--caption-size)", padding: 0, cursor: "pointer", border: 0, background: "transparent", color: "var(--ink-4)", textDecoration: "underline" }}>change</button></span>
            : <span>optional: how online are you?{" "}
              {COHORTS.map(([cid, label], ci) => (
                <button key={cid} onClick={() => pickCohort(cid)}
                  style={{ fontFamily: "var(--mono)", fontSize: "var(--caption-size)", padding: "6px 8px", cursor: "pointer", border: "var(--border)", background: "transparent", color: "var(--ink-2)", marginLeft: ci ? "6px" : 0 }}>{label}</button>
              ))}
            </span>}
        </div>
        <div style={{ borderTop: "var(--border)", padding: "var(--panel-foot-pad)", fontFamily: "var(--mono)", fontSize: "var(--caption-size)", color: "var(--ink-3)" }}>
          {bout.id + (isProbe ? " · real human-written jokes · " : " · premise " + bout.premise + " · ") + bout.ballots + " ballots on this pair"}
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

const { TrackPanel, Sparkline } = window.LOLBenchDesignSystem_ab2c27;

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
  const written = data.written.map(w => ({ label: w.label, value: w.value, thin: w.value < writtenTarget * 0.3 }));
  const totalWritten = data.written.reduce((s, w) => s + w.value, 0);
  const scoredStatus = data.pending > 0
    ? `${data.scored.length} of ${data.scored.length + data.pending} scored`
    : `${data.scored.length} of ${data.scored.length} scored`;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: "var(--rule)", border: "var(--border)", marginTop: "30px" }}>
      <TrackPanel index="01" status={scoredStatus} question="Does it get the joke?"
        method="It explains why a joke works. We check that against notes a human wrote."
        chart={<Sparkline bars={bars} pending={data.pending} />}
        caption="one bar per model, best first · lime = best in its price tier · orange = too thin to trust · dark = still being judged" />
      <TrackPanel index="02" status="you are the judge" statusTone="ink" question="Can it land one?"
        method="Two models write on the same setup. Humans pick the funnier line, blind."
        chart={<Sparkline min={0} max={writtenTarget} bars={written} />}
        caption={`jokes written per model · ${writtenTarget} is a full set · ${totalWritten.toLocaleString()} written so far`} />
      <TrackPanel index="03" status="next data drop" statusTone="quiet" question="Does it laugh with us?"
        method="It ranks 1,500 jokes best to worst. We compare its ranking to ours."
        chart={<div style={{ height: "56px", marginTop: "14px", border: "1px dashed var(--rule-2)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: "11px", color: "var(--ink-3)" }}>no data yet</div>}
        caption="cheapest skill to test · no benchmark covers it" />
    </div>
  );
}
Object.assign(window, { Tracks });

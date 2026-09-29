const { Topbar, Footer, Kicker, Headline, Lede, StatBand, Panel } = window.LOLBenchDesignSystem_ab2c27;
const VotePanel = window.VotePanel;
const KillTestPanel = window.KillTestPanel;
const SubmitPanel = window.SubmitPanel;

function SiteApp() {
  const data = window.LOLB;
  // The dissociation, computed rather than asserted. A model counts as "falls
  // off on failed jokes" when its F6 mean is below its best real-joke tier
  // (T1/T2/T3). Written this way the lede stays true if the data moves, instead
  // of being a sentence someone wrote once and never revisited.
  const rows = data.mechanismRows;
  const realBest = r => ["T1", "T2", "T3"]
    .map(t => r.values[t]).filter(v => v != null)
    .reduce((a, v) => (a == null || v > a ? v : a), null);
  const withBoth = rows.filter(r => r.values.F6 != null && realBest(r) != null);
  const fallers = withBoth.filter(r => r.values.F6 < realBest(r));
  const f6Best = withBoth.length ? Math.max(...withBoth.map(r => r.values.F6)) : null;
  const f6Worst = withBoth.length ? Math.min(...withBoth.map(r => r.values.F6)) : null;
  const realCeiling = withBoth.length ? Math.max(...withBoth.map(realBest)) : null;
  return (
    <>
      <Topbar current="scores" stamp={data.stamp}
        nav={[
          { label: "scores" },
          { label: "vote", onClick: e => { e.preventDefault(); document.getElementById("vote-panel").scrollIntoView({ behavior: "smooth" }); } },
          { label: "github", href: "https://github.com/YakshithK/lolbench" }
        ]} />
      <div className="wrap">
        <div className="rv" style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: "56px", alignItems: "end", padding: "var(--hero-pad)", borderBottom: "var(--border)" }}>
          <div>
            <Kicker>wave 00 / open results</Kicker>
            <Headline>Does it get<br />the joke?</Headline>
            <Lede>{fallers.length
              ? <>{fallers.length} of the {withBoth.length} models here explain real jokes better than they explain failed ones. The best of them reaches {realCeiling} on jokes that work and {f6Best} on jokes that don't.</>
              : "We are measuring whether a model can explain a joke, write one, and tell good ones from bad."}</Lede>
          </div>
          <Panel title="Best line written so far" meta="author concealed until you vote"
            caption={<>{data.bouts[0].id + " · " + data.bouts[0].ballots + " ballots on this pair"}</>}>
            <p style={{ fontFamily: "var(--body)", fontWeight: 200, fontStyle: "italic", fontSize: "18px", lineHeight: 1.45, color: "#d6d4cf" }}>{data.bouts[0].b}</p>
          </Panel>
        </div>

        {/* Full-width, not tucked in the sidebar: voting is the one thing on
            this page we're actively asking a first-time visitor to do, so it
            gets its own prominent section instead of competing for space with
            the standings table and written-jokes chart. */}
        <div style={{ paddingTop: "30px" }}>
          <VotePanel bouts={data.bouts} />
        </div>

        {/* The two "help us out" asks, grouped and both opt-in. They sit after
            the booth because they are the same kind of request at a different
            cost: the booth is one click, these are real labor, so neither is
            ever pushed on a visitor who only came to look at scores. */}
        <div style={{ display: "grid", gap: "var(--gap-panel)", paddingTop: "26px" }}>
          <KillTestPanel items={data.killtest} />
          <SubmitPanel />
        </div>

        <Tracks data={data} />

        <div style={{ display: "grid", gridTemplateColumns: "var(--main-cols)", gap: "var(--gap-panel)", paddingTop: "30px" }}>
          <Charts data={data} />
          <Sidebar data={data} />
        </div>

        <StatBand stats={[
          { label: "jokes in the set", value: String(data.itemsCount), note: "checked by hand before anything ran" },
          { label: "who grades", value: "2 models", note: "from other labs, never the one being graded" },
          { label: "who decides funny", value: "you do", note: "no model ever rates a punchline" },
          { label: "judge distance", value: data.judgeDistance != null ? data.judgeDistance.toFixed(1) + " pts" : "pending", note: data.judgeDistance != null ? `r=${data.judgeCorrelation} on ${data.judgePairs.toLocaleString()} double-judged pairs — not yet checked against a human` : "no dual-judged pairs yet" }
        ]} />
      </div>
      <Footer />
    </>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<SiteApp />);

const { Topbar, Footer, Kicker, Headline, Lede, StatBand, Panel } = window.LOLBenchDesignSystem_ab2c27;
const VotePanel = window.VotePanel;

const COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

function SiteApp() {
  const data = window.LOLB;
  const f6 = data.mechanismRows.map(r => r.values.F6).filter(v => v != null);
  const allMissF6 = f6.length > 0 && f6.every(v => v < 90);
  const total = data.scored.length + data.unrankable.length;
  const countWord = COUNT_WORDS[total] || String(total);
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
            <Headline>{countWord[0].toUpperCase() + countWord.slice(1)} models walk<br />into a bar.</Headline>
            <Lede>{allMissF6
              ? "All of them can explain why a real joke works. None of them reliably knows why a fake one doesn't."
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

        <Tracks data={data} />

        <div style={{ display: "grid", gridTemplateColumns: "var(--main-cols)", gap: "var(--gap-panel)", paddingTop: "30px" }}>
          <Charts data={data} />
          <Sidebar data={data} />
        </div>

        <StatBand stats={[
          { label: "jokes in the set", value: String(data.itemsCount), note: "written and checked by hand" },
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

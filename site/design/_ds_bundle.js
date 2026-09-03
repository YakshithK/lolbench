/* @ds-bundle: {"format":4,"namespace":"LOLBenchDesignSystem_ab2c27","components":[{"name":"Footer","sourcePath":"components/chrome/Footer.jsx"},{"name":"Mark","sourcePath":"components/chrome/Mark.jsx"},{"name":"Topbar","sourcePath":"components/chrome/Topbar.jsx"},{"name":"Wordmark","sourcePath":"components/chrome/Wordmark.jsx"},{"name":"BarList","sourcePath":"components/data/BarList.jsx"},{"name":"DotMatrix","sourcePath":"components/data/DotMatrix.jsx"},{"name":"Heatmap","sourcePath":"components/data/Heatmap.jsx"},{"name":"RankChip","sourcePath":"components/data/RankChip.jsx"},{"name":"Scatter","sourcePath":"components/data/Scatter.jsx"},{"name":"ScoreCell","sourcePath":"components/data/ScoreCell.jsx"},{"name":"Sparkline","sourcePath":"components/data/Sparkline.jsx"},{"name":"SpendCell","sourcePath":"components/data/SpendCell.jsx"},{"name":"Standings","sourcePath":"components/data/Standings.jsx"},{"name":"Headline","sourcePath":"components/head/Headline.jsx"},{"name":"Kicker","sourcePath":"components/head/Kicker.jsx"},{"name":"Lede","sourcePath":"components/head/Lede.jsx"},{"name":"StatBand","sourcePath":"components/head/StatBand.jsx"},{"name":"StatusChip","sourcePath":"components/head/StatusChip.jsx"},{"name":"DefenseRows","sourcePath":"components/layout/DefenseRows.jsx"},{"name":"Panel","sourcePath":"components/layout/Panel.jsx"},{"name":"PendingLine","sourcePath":"components/layout/PendingLine.jsx"},{"name":"Tabs","sourcePath":"components/nav/Tabs.jsx"},{"name":"TrackPanel","sourcePath":"components/nav/TrackPanel.jsx"},{"name":"BallotControls","sourcePath":"components/vote/BallotControls.jsx"},{"name":"Bout","sourcePath":"components/vote/Bout.jsx"},{"name":"Joke","sourcePath":"components/vote/Joke.jsx"},{"name":"Reveal","sourcePath":"components/vote/Reveal.jsx"}],"sourceHashes":{"components/chrome/Footer.jsx":"7f73851a093f","components/chrome/Mark.jsx":"2a7a455a5d12","components/chrome/Topbar.jsx":"7caeb3e1c401","components/chrome/Wordmark.jsx":"a4f0e88afb94","components/data/BarList.jsx":"76e8290711c9","components/data/DotMatrix.jsx":"d693b4b026f6","components/data/Heatmap.jsx":"ea1e9d1df2ac","components/data/RankChip.jsx":"b05421e5df19","components/data/Scatter.jsx":"04a5ab9c8d44","components/data/ScoreCell.jsx":"577f47c65f5e","components/data/Sparkline.jsx":"dd598a095446","components/data/SpendCell.jsx":"34df358eb2e6","components/data/Standings.jsx":"83b5ddf1d29b","components/head/Headline.jsx":"6400ed978526","components/head/Kicker.jsx":"4040feb534a0","components/head/Lede.jsx":"1f68c4b5f583","components/head/StatBand.jsx":"b756cb7ac840","components/head/StatusChip.jsx":"27cb06f71b2f","components/layout/DefenseRows.jsx":"47218baaa7ec","components/layout/Panel.jsx":"8055f81601df","components/layout/PendingLine.jsx":"6aa62fcbe270","components/nav/Tabs.jsx":"f6b3b22c4b51","components/nav/TrackPanel.jsx":"79ac0562696c","components/vote/BallotControls.jsx":"a8f4f1177465","components/vote/Bout.jsx":"1be11ffcd8a7","components/vote/Joke.jsx":"bb21fb548f8a","components/vote/Reveal.jsx":"b09291e338ae","ui_kits/lolbench_site/Charts.jsx":"200e6ff37fba","ui_kits/lolbench_site/Sidebar.jsx":"c0680b015bc9","ui_kits/lolbench_site/SiteApp.jsx":"186670efbf2c","ui_kits/lolbench_site/Tracks.jsx":"055f8aabd515","ui_kits/lolbench_site/data.js":"26ea2f032982"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LOLBenchDesignSystem_ab2c27 = window.LOLBenchDesignSystem_ab2c27 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/chrome/Footer.jsx
try { (() => {
/* Hairline-topped provenance row: what this is, where the code is, how much to
   trust it today. */
function Footer({
  left = "lolbench.lol",
  repo = "source and raw data on github",
  repoHref = "https://github.com/YakshithK/lolbench",
  right = "early results · rankings will move"
}) {
  return /*#__PURE__*/React.createElement("footer", {
    className: "wrap",
    style: {
      marginTop: "34px",
      paddingTop: "16px",
      borderTop: "var(--border)",
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
      fontFamily: "var(--mono)",
      fontSize: "var(--caption-size)",
      color: "var(--ink-3)"
    }
  }, /*#__PURE__*/React.createElement("span", null, left), /*#__PURE__*/React.createElement("a", {
    href: repoHref,
    style: {
      color: "var(--ink-4)"
    }
  }, repo), /*#__PURE__*/React.createElement("span", null, right));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chrome/Footer.jsx", error: String((e && e.message) || e) }); }

// components/chrome/Mark.jsx
try { (() => {
/* The LOL Bench mark: an error bar with its ends turned up. The caps are the
   interval, the curve is the mouth. Minimum width 20px; below that use the
   wordmark alone. */
function Mark({
  width = 26,
  color = "var(--accent-brand)",
  title = "LOL Bench"
}) {
  return /*#__PURE__*/React.createElement("svg", {
    width: width,
    height: width * (17 / 26),
    viewBox: "0 0 72 44",
    role: "img",
    "aria-label": title,
    style: {
      display: "block",
      flex: "none"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 12 Q36 40 62 12",
    fill: "none",
    stroke: color,
    strokeWidth: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "10",
    y1: "1",
    x2: "10",
    y2: "14",
    stroke: color,
    strokeWidth: "8"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "62",
    y1: "1",
    x2: "62",
    y2: "14",
    stroke: color,
    strokeWidth: "8"
  }));
}
Object.assign(__ds_scope, { Mark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chrome/Mark.jsx", error: String((e && e.message) || e) }); }

// components/chrome/Wordmark.jsx
try { (() => {
/* Primary lockup: mark + "LOL BENCH" in mono 700. The mark's height matches the
   wordmark's cap height. */
function Wordmark({
  href = "/",
  size = 14,
  showMark = true
}) {
  const Tag = href ? "a" : "span";
  return /*#__PURE__*/React.createElement(Tag, {
    href: href || undefined,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "9px",
      textDecoration: "none",
      color: "var(--ink)"
    }
  }, showMark && /*#__PURE__*/React.createElement(__ds_scope.Mark, {
    width: size * 1.85
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontWeight: 700,
      fontSize: size + "px",
      letterSpacing: "-.02em"
    }
  }, "LOL BENCH"));
}
Object.assign(__ds_scope, { Wordmark });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chrome/Wordmark.jsx", error: String((e && e.message) || e) }); }

// components/chrome/Topbar.jsx
try { (() => {
/* 56px bar closed by a hairline. Lockup left, mono nav centre, provenance stamp
   right. The stamp is disclosure, not decoration. */
function Topbar({
  nav = [],
  current,
  stamp
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: "var(--border)",
      background: "var(--canvas)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "wrap",
    style: {
      height: "var(--topbar-h)",
      display: "flex",
      alignItems: "center",
      gap: "32px"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Wordmark, null), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: "24px",
      fontFamily: "var(--mono)",
      fontSize: "12px"
    }
  }, nav.map(item => {
    const on = item.label === current;
    return /*#__PURE__*/React.createElement("a", {
      key: item.label,
      href: item.href || "#",
      onClick: item.onClick,
      "aria-current": on ? "page" : undefined,
      style: {
        color: on ? "var(--ink)" : "var(--ink-4)",
        textDecoration: "none",
        paddingBottom: "3px",
        borderBottom: on ? "1px solid var(--accent-brand)" : "1px solid transparent",
        cursor: "pointer"
      }
    }, item.label);
  })), stamp && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "auto",
      fontFamily: "var(--mono)",
      fontSize: "var(--stamp-size)",
      color: "var(--ink-3)"
    }
  }, stamp)));
}
Object.assign(__ds_scope, { Topbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/chrome/Topbar.jsx", error: String((e && e.message) || e) }); }

// components/data/BarList.jsx
try { (() => {
/* Completion bars: how much of an assigned set a model has finished. Neutral by
   rule, orange when barely started. Completion is never lime: finishing is not
   winning. */
function BarList({
  rows = [],
  target = 100,
  thinPct = 10
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "11px"
    }
  }, rows.map(r => {
    const pct = Math.min(100, r.value / target * 100);
    const color = pct <= thinPct ? "var(--accent-distrust)" : pct >= 95 ? "var(--ink-2)" : "var(--ink-4)";
    return /*#__PURE__*/React.createElement("div", {
      key: r.label,
      style: {
        display: "grid",
        gridTemplateColumns: "136px 1fr 34px",
        gap: "10px",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--mono)",
        fontSize: "var(--caption-size)"
      }
    }, r.label), /*#__PURE__*/React.createElement("div", {
      style: {
        height: "var(--bar-h)",
        background: "var(--well)"
      }
    }, /*#__PURE__*/React.createElement("i", {
      style: {
        display: "block",
        height: "100%",
        width: pct + "%",
        background: color
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--mono)",
        fontSize: "var(--caption-size)",
        color: "var(--ink-2)",
        textAlign: "right"
      }
    }, r.value));
  }));
}
Object.assign(__ds_scope, { BarList });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/BarList.jsx", error: String((e && e.message) || e) }); }

// components/data/DotMatrix.jsx
try { (() => {
/* How much data is behind a number. One square per 10 graded answers, a partial
   square for the remainder, and the whole row in distrust orange when the
   sample is too thin to trust at all. */
function DotMatrix({
  rows = [],
  per = 10,
  thinBelow = 10
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "13px"
    }
  }, rows.map(r => {
    const thin = r.n < thinBelow;
    const color = thin ? "var(--accent-distrust)" : "var(--ink-mute)";
    const full = Math.floor(r.n / per);
    const rem = r.n % per;
    return /*#__PURE__*/React.createElement("div", {
      key: r.label,
      style: {
        display: "grid",
        gridTemplateColumns: "150px 1fr 46px",
        gap: "14px",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--mono)",
        fontSize: "12px"
      }
    }, r.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "2px"
      }
    }, Array.from({
      length: full
    }, (_, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        width: "var(--square)",
        height: "var(--square)",
        background: color,
        display: "block"
      }
    })), rem > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        width: Math.max(3, Math.round(rem / per * 9)) + "px",
        height: "var(--square)",
        background: color,
        display: "block"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--mono)",
        fontSize: "12px",
        color: thin ? "var(--accent-distrust)" : "var(--ink-2)",
        textAlign: "right"
      }
    }, r.n));
  }));
}
Object.assign(__ds_scope, { DotMatrix });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DotMatrix.jsx", error: String((e && e.message) || e) }); }

// components/data/Heatmap.jsx
try { (() => {
/* Model by joke-mechanism grid. The sequential ramp runs olive to lime; a zero
   is drawn in distrust orange because a zero is a failure, not a low score.
   Absent data is an empty well cell, never a zero. */
function Heatmap({
  columns = [],
  rows = [],
  warnColumn
}) {
  const fill = v => {
    if (v == null) return "var(--well)";
    if (v === 0) return "var(--scale-0)";
    if (v >= 100) return "var(--scale-6)";
    if (v >= 96) return "var(--scale-5)";
    if (v >= 90) return "var(--scale-4)";
    if (v >= 75) return "var(--scale-3)";
    if (v >= 60) return "var(--scale-2)";
    return "var(--scale-1)";
  };
  /* Light ink only survives on the two darkest olives; everything brighter,
     including the orange zero, takes canvas-dark text. */
  const ink = v => v == null ? "var(--ink)" : v === 0 || v >= 75 ? "var(--canvas)" : "var(--ink)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "150px repeat(" + columns.length + ",1fr)",
      gap: "4px",
      minWidth: 520
    }
  }, /*#__PURE__*/React.createElement("span", null), columns.map(c => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: {
      fontFamily: "var(--mono)",
      fontSize: "var(--label-size)",
      color: c === warnColumn ? "var(--accent-distrust)" : "var(--ink-4)",
      textAlign: "center"
    }
  }, c)), rows.map(r => /*#__PURE__*/React.createElement(React.Fragment, {
    key: r.label
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "12px",
      alignSelf: "center"
    }
  }, r.label), columns.map(c => {
    const v = r.values[c];
    return /*#__PURE__*/React.createElement("span", {
      key: c,
      title: v == null ? r.label + " · " + c + " · no data yet" : r.label + " · " + c + " · " + v,
      style: {
        background: fill(v),
        height: "var(--heat-cell-h)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--mono)",
        fontSize: "11px",
        color: ink(v)
      }
    }, v == null ? "" : v);
  })))));
}
Object.assign(__ds_scope, { Heatmap });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Heatmap.jsx", error: String((e && e.message) || e) }); }

// components/data/RankChip.jsx
try { (() => {
/* Rank cell. Tier leaders get the lime chip; everyone else is a quiet mono
   numeral; an unrankable row gets an orange dash instead of a number. */
function RankChip({
  rank,
  leader = false
}) {
  if (rank == null) return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      color: "var(--accent-distrust)"
    }
  }, "\u2014");
  const str = String(rank).padStart(2, "0");
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "13px",
      color: leader ? "var(--accent-leader)" : "var(--ink-3)"
    }
  }, str);
}
Object.assign(__ds_scope, { RankChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/RankChip.jsx", error: String((e && e.message) || e) }); }

// components/data/Scatter.jsx
try { (() => {
/* Score against cost. Dots are models, the vertical orange bar is the range the
   score could really be in.

   Two rules learned the hard way:
   1. The y-axis is derived from the data, never clamped. An interval that runs to
      25 must be drawn to 25, or a reader cannot tell it from one that stops at 70.
   2. Labels do NOT live in the plot. Several models sit on the free axis and their
      bars cover most of the plot height, so in-plot text is always struck through
      by some other model's interval. The labels are a legend gutter instead, in
      chart order, each carrying the score and the cost. */
function Scatter({
  points = [],
  xMax = 2,
  yMin,
  yMax = 100,
  freeCut = 0.07,
  rule,
  label = "Score against cost",
  legend = true
}) {
  const lo0 = points.length ? Math.min(...points.map(p => p.lo)) : 70;
  const floor = yMin != null ? yMin : Math.max(0, Math.floor((lo0 - 4) / 10) * 10);
  const X = v => 56 + Math.min(v, xMax) / xMax * 728;
  const Y = v => 380 - (Math.max(floor, Math.min(yMax, v)) - floor) / (yMax - floor) * 322;
  const ticks = [0, 1, 2, 3].map(i => Math.round(floor + i * (yMax - floor) / 3));
  const swatch = p => p.leader ? "var(--accent-leader)" : p.x > 0 ? "var(--ink)" : "var(--ink-mute)";
  const ordered = [...points].sort((a, b) => b.y - a.y);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 800 440",
    role: "img",
    "aria-label": label,
    style: {
      display: "block",
      width: "100%",
      height: "auto"
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: "56",
    y1: "40",
    x2: "56",
    y2: "380",
    stroke: "var(--rule-2)"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "56",
    y1: "380",
    x2: "784",
    y2: "380",
    stroke: "var(--rule-2)"
  }), ticks.map(v => /*#__PURE__*/React.createElement("g", {
    key: v
  }, /*#__PURE__*/React.createElement("line", {
    x1: "56",
    y1: Y(v),
    x2: "784",
    y2: Y(v),
    stroke: "var(--well)"
  }), /*#__PURE__*/React.createElement("text", {
    x: "46",
    y: Y(v) + 4,
    textAnchor: "end",
    fill: "var(--ink-3)",
    fontFamily: "Azeret Mono, monospace",
    fontSize: "10"
  }, v))), /*#__PURE__*/React.createElement("line", {
    x1: X(freeCut * xMax),
    y1: "40",
    x2: X(freeCut * xMax),
    y2: "380",
    stroke: "var(--rule-2)",
    strokeDasharray: "2 5"
  }), /*#__PURE__*/React.createElement("text", {
    x: X(freeCut * xMax) + 8,
    y: "376",
    fill: "var(--ink-3)",
    fontFamily: "Azeret Mono, monospace",
    fontSize: "10"
  }, "paid \u2192"), /*#__PURE__*/React.createElement("text", {
    x: "56",
    y: "402",
    textAnchor: "middle",
    fill: "var(--ink-3)",
    fontFamily: "Azeret Mono, monospace",
    fontSize: "10"
  }, "free"), /*#__PURE__*/React.createElement("text", {
    x: "784",
    y: "402",
    textAnchor: "end",
    fill: "var(--ink-3)",
    fontFamily: "Azeret Mono, monospace",
    fontSize: "10"
  }, "$" + xMax.toFixed(2)), /*#__PURE__*/React.createElement("text", {
    x: "56",
    y: "426",
    fill: "var(--ink-4)",
    fontFamily: "Azeret Mono, monospace",
    fontSize: "10"
  }, "what it cost to run the whole set \u2192"), rule && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: "270",
    y1: Y(rule.at),
    x2: "430",
    y2: Y(rule.at),
    stroke: "var(--accent-leader)",
    strokeDasharray: "3 6",
    opacity: ".5"
  }), /*#__PURE__*/React.createElement("text", {
    x: "270",
    y: "32",
    fill: "var(--accent-leader)",
    fontFamily: "Azeret Mono, monospace",
    fontSize: "10"
  }, rule.label)), points.map(p => {
    const cx = X(p.x);
    return /*#__PURE__*/React.createElement("g", {
      key: p.label
    }, /*#__PURE__*/React.createElement("line", {
      x1: cx,
      y1: Y(p.hi),
      x2: cx,
      y2: Y(p.lo),
      stroke: "var(--accent-distrust)",
      strokeWidth: "2",
      opacity: p.thin ? .55 : 1
    }), /*#__PURE__*/React.createElement("circle", {
      cx: cx,
      cy: Y(p.y),
      r: "5.5",
      fill: swatch(p)
    }, /*#__PURE__*/React.createElement("title", null, p.label + " · " + p.y.toFixed(1) + " · range " + p.lo.toFixed(1) + " to " + p.hi.toFixed(1) + " · " + (p.x ? "$" + p.x.toFixed(2) : "free"))));
  })), legend && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
      gap: "8px 20px",
      padding: "16px 18px 4px"
    }
  }, ordered.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.label,
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "8px",
      fontFamily: "var(--mono)",
      fontSize: "var(--caption-size)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: "9px",
      height: "9px",
      borderRadius: "50%",
      background: swatch(p),
      flex: "none",
      transform: "translateY(-1px)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: p.leader ? "var(--accent-leader)" : "var(--ink-2)"
    }
  }, p.label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink)",
      marginLeft: "auto"
    }
  }, p.y.toFixed(1)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-distrust)"
    }
  }, "±" + ((p.hi - p.lo) / 2).toFixed(1)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink-3)",
      minWidth: "42px",
      textAlign: "right"
    }
  }, p.x ? "$" + p.x.toFixed(2) : "free")))));
}
Object.assign(__ds_scope, { Scatter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Scatter.jsx", error: String((e && e.message) || e) }); }

// components/data/ScoreCell.jsx
try { (() => {
/* A score and the range it could really be in. The range is always orange and
   always present: a score without one does not ship. */
function ScoreCell({
  value,
  plusMinus,
  on
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "13px",
      fontVariantNumeric: "tabular-nums"
    }
  }, value.toFixed(1), " ", plusMinus != null && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-distrust)",
      fontSize: "var(--caption-size)"
    }
  }, "±" + plusMinus.toFixed(1)), on != null && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-distrust)",
      fontSize: "var(--caption-size)"
    }
  }, "on " + on));
}
Object.assign(__ds_scope, { ScoreCell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ScoreCell.jsx", error: String((e && e.message) || e) }); }

// components/data/Sparkline.jsx
try { (() => {
/* Track summary bars, one per model, tallest first. Lime for a tier leader,
   orange for a sample too thin to trust, neutral for the rest, and well-coloured
   stubs for models still being judged. */
function Sparkline({
  bars = [],
  pending = 0,
  min = 70,
  max = 100,
  label = "Track summary"
}) {
  const n = bars.length + pending;
  const w = n ? Math.max(6, Math.floor(360 / n) - 4) : 20;
  const step = w + 4;
  const h = v => Math.max(2, (Math.max(min, Math.min(max, v)) - min) / (max - min) * 36);
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 360 56",
    role: "img",
    "aria-label": label,
    style: {
      display: "block",
      width: "100%",
      marginTop: "14px"
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: "0",
    y1: "46",
    x2: "360",
    y2: "46",
    stroke: "var(--rule-2)"
  }), bars.map((b, i) => /*#__PURE__*/React.createElement("rect", {
    key: b.label,
    x: i * step,
    y: 46 - h(b.value),
    width: w,
    height: h(b.value),
    fill: b.thin ? "var(--accent-distrust)" : b.leader ? "var(--accent-leader)" : "var(--ink-2)"
  }, /*#__PURE__*/React.createElement("title", null, b.label + " · " + b.value))), Array.from({
    length: pending
  }, (_, i) => /*#__PURE__*/React.createElement("rect", {
    key: "p" + i,
    x: (bars.length + i) * step,
    y: "42",
    width: w,
    height: "4",
    fill: "var(--rule-2)"
  })));
}
Object.assign(__ds_scope, { Sparkline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Sparkline.jsx", error: String((e && e.message) || e) }); }

// components/data/SpendCell.jsx
try { (() => {
/* Cost sits beside every score. Free is a fact, not a boast: it stays neutral. */
function SpendCell({
  usd,
  state
}) {
  if (usd == null) return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "13px",
      color: state === "not started" ? "var(--accent-distrust)" : "var(--ink-3)"
    }
  }, state || "queued");
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "13px",
      color: "var(--ink-2)"
    }
  }, usd === 0 ? "free" : "$" + usd.toFixed(2));
}
Object.assign(__ds_scope, { SpendCell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/SpendCell.jsx", error: String((e && e.message) || e) }); }

// components/data/Standings.jsx
try { (() => {
/* Ranked rows: hairline separators, mono throughout, and an optional unranked
   row pinned below the ranking with the reason in the footer. In-progress and
   unrankable are designed states, never blanks. */
function Standings({
  rows = [],
  unranked = [],
  footer,
  meta
}) {
  const cols = "22px 1fr 96px";
  const cell = {
    padding: "var(--cell-pad)",
    fontFamily: "var(--mono)",
    fontSize: "13px"
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: cols,
      gap: "10px",
      padding: "10px 18px",
      fontFamily: "var(--mono)",
      fontSize: "var(--label-size)",
      letterSpacing: ".12em",
      textTransform: "uppercase",
      color: "var(--ink-3)",
      borderBottom: "var(--border)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "#"), /*#__PURE__*/React.createElement("span", null, "model"), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right"
    }
  }, meta || "score")), rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: r.label,
    style: {
      ...cell,
      display: "grid",
      gridTemplateColumns: cols,
      gap: "10px",
      borderBottom: i === rows.length - 1 && !unranked.length ? 0 : "1px solid #12151a"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: r.leader ? "var(--accent-leader)" : "var(--ink-3)"
    }
  }, String(i + 1).padStart(2, "0")), /*#__PURE__*/React.createElement("span", null, r.label), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right"
    }
  }, r.score))), unranked.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.label,
    style: {
      ...cell,
      display: "grid",
      gridTemplateColumns: cols,
      gap: "10px",
      borderTop: "var(--border)",
      color: "var(--ink-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-distrust)"
    }
  }, "\u2014"), /*#__PURE__*/React.createElement("span", null, r.label), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: "right"
    }
  }, r.score))), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "var(--border)",
      padding: "var(--panel-foot-pad)",
      fontFamily: "var(--mono)",
      fontSize: "var(--caption-size)",
      color: "var(--ink-3)",
      lineHeight: 1.7
    }
  }, footer));
}
Object.assign(__ds_scope, { Standings });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Standings.jsx", error: String((e && e.message) || e) }); }

// components/head/Headline.jsx
try { (() => {
/* Display type: Bricolage Grotesque 800, near-zero leading. Write it as a setup
   and let the lede carry the punchline. */
function Headline({
  children,
  size
}) {
  return /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--display)",
      fontWeight: 800,
      fontSize: size || "var(--h1-size)",
      lineHeight: "var(--h1-leading)",
      letterSpacing: "var(--h1-tracking)",
      marginTop: "20px"
    }
  }, children);
}
Object.assign(__ds_scope, { Headline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/head/Headline.jsx", error: String((e && e.message) || e) }); }

// components/head/Kicker.jsx
try { (() => {
/* Brand-lime eyebrow above the headline. One per page. */
function Kicker({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "var(--caption-size)",
      letterSpacing: "var(--kicker-tracking)",
      textTransform: "uppercase",
      color: "var(--accent-brand)"
    }
  }, children);
}
Object.assign(__ds_scope, { Kicker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/head/Kicker.jsx", error: String((e && e.message) || e) }); }

// components/head/Lede.jsx
try { (() => {
/* The punchline paragraph: Sora 200 at 22px, 40 to 52 characters wide. */
function Lede({
  children,
  measure = "40ch"
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: "22px",
      fontFamily: "var(--body)",
      fontSize: "var(--sub-size)",
      fontWeight: 200,
      color: "var(--ink-2)",
      maxWidth: measure
    }
  }, children);
}
Object.assign(__ds_scope, { Lede });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/head/Lede.jsx", error: String((e && e.message) || e) }); }

// components/head/StatBand.jsx
try { (() => {
/* Full-width hairline-gapped band of 3 to 4 facts. Closes a page; never used as
   a hero. Each cell is one mono numeral plus one plain sentence. */
function StatBand({
  stats = []
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(" + Math.max(1, stats.length) + ",1fr)",
      gap: "1px",
      background: "var(--rule)",
      border: "var(--border)",
      marginTop: "var(--gap-panel)"
    }
  }, stats.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.label,
    style: {
      background: "var(--surface)",
      padding: "var(--band-pad)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "var(--label-size)",
      letterSpacing: "var(--label-tracking)",
      textTransform: "uppercase",
      color: "var(--ink-3)"
    }
  }, s.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "var(--data-lg-size)",
      fontWeight: 600,
      marginTop: "5px",
      fontVariantNumeric: "tabular-nums"
    }
  }, s.value), s.note && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "14px",
      fontWeight: 200,
      color: "var(--ink-4)",
      marginTop: "4px"
    }
  }, s.note))));
}
Object.assign(__ds_scope, { StatBand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/head/StatBand.jsx", error: String((e && e.message) || e) }); }

// components/head/StatusChip.jsx
try { (() => {
/* Mono status chip. Brand lime for live states, ink for human-in-the-loop,
   ink-3 for not-yet, distrust orange for warnings. */
function StatusChip({
  children,
  tone = "brand"
}) {
  const color = tone === "brand" ? "var(--accent-brand)" : tone === "warn" ? "var(--accent-distrust)" : tone === "quiet" ? "var(--ink-3)" : "var(--ink)";
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "var(--label-size)",
      color
    }
  }, children);
}
Object.assign(__ds_scope, { StatusChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/head/StatusChip.jsx", error: String((e && e.message) || e) }); }

// components/layout/DefenseRows.jsx
try { (() => {
/* Risk to defense, joined by an arrow. Used where a reader might reasonably ask
   why a number here should be believed. */
function DefenseRows({
  rows = []
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid"
    }
  }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 16px 1fr",
      gap: "10px",
      padding: "11px 0",
      borderBottom: i === rows.length - 1 ? 0 : "var(--border)",
      fontSize: "14px",
      fontWeight: 200,
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink-4)"
    }
  }, r.risk), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--accent-brand)",
      textAlign: "center"
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink)"
    }
  }, r.defense))));
}
Object.assign(__ds_scope, { DefenseRows });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/DefenseRows.jsx", error: String((e && e.message) || e) }); }

// components/layout/Panel.jsx
try { (() => {
/* The only container: hairline outline on the glass surface, with a header row
   (display-face title left, mono meta right) and an optional caption strip.
   The caption is where a chart is explained; it is never optional in practice. */
function Panel({
  title,
  meta,
  children,
  caption,
  pad = true,
  size = "md"
}) {
  const titleSize = size === "lg" ? "var(--h2-size)" : "var(--h4-size)";
  const titleWeight = size === "lg" ? 800 : 700;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "var(--border)",
      background: "var(--surface-glass)"
    }
  }, (title || meta) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: "16px",
      padding: "var(--panel-head-pad)",
      borderBottom: "var(--border)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--display)",
      fontWeight: titleWeight,
      fontSize: titleSize,
      letterSpacing: "-.025em"
    }
  }, title), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "var(--caption-size)",
      color: "var(--ink-3)",
      textAlign: "right"
    }
  }, meta)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: pad ? "var(--panel-body-pad)" : 0
    }
  }, children), caption && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "var(--border)",
      padding: "var(--panel-foot-pad)",
      fontFamily: "var(--mono)",
      fontSize: "var(--caption-size)",
      color: "var(--ink-3)",
      lineHeight: 1.7
    }
  }, caption));
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Panel.jsx", error: String((e && e.message) || e) }); }

// components/layout/PendingLine.jsx
try { (() => {
/* The dashed "nothing here yet" block, and the only dashed border in the system.
   It replaces a table entirely rather than sitting above an empty one. */
function PendingLine({
  lead,
  children,
  center = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px dashed var(--rule-2)",
      padding: "20px",
      background: "var(--surface)",
      textAlign: center ? "center" : "left"
    }
  }, lead && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--display)",
      fontWeight: 700,
      fontSize: "17px"
    }
  }, lead), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "14px",
      fontWeight: 200,
      color: "var(--ink-4)",
      marginTop: "6px"
    }
  }, children));
}
Object.assign(__ds_scope, { PendingLine });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/PendingLine.jsx", error: String((e && e.message) || e) }); }

// components/nav/Tabs.jsx
try { (() => {
/* View switcher for one dataset: plot, table, vote. Selected tab is a lime fill
   with canvas text; the rest are quiet mono on the hairline frame. */
function Tabs({
  tabs = [],
  value,
  onChange,
  label = "Views"
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    "aria-label": label,
    style: {
      display: "flex",
      border: "var(--border)"
    }
  }, tabs.map((t, i) => {
    const on = t.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      role: "tab",
      "aria-selected": on,
      "aria-controls": t.id,
      onClick: () => onChange && onChange(t.id),
      style: {
        fontFamily: "var(--mono)",
        fontSize: "12px",
        padding: "9px 15px",
        cursor: "pointer",
        border: 0,
        borderLeft: i ? "var(--border)" : 0,
        background: on ? "var(--accent-brand)" : "transparent",
        color: on ? "var(--canvas)" : "var(--ink-4)",
        fontWeight: on ? 600 : 400,
        transition: "background var(--motion-state),color var(--motion-state)"
      }
    }, t.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/nav/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/nav/TrackPanel.jsx
try { (() => {
/* One of the three skills, as an equal panel: eyebrow, plain-language question,
   one sentence of method, its own small chart, and a caption naming the colours. */
function TrackPanel({
  index,
  status,
  statusTone = "brand",
  question,
  method,
  chart,
  caption
}) {
  const statusColor = statusTone === "brand" ? "var(--accent-brand)" : statusTone === "quiet" ? "var(--ink-3)" : "var(--ink)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface)",
      padding: "var(--track-pad)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "var(--label-size)",
      letterSpacing: ".16em",
      textTransform: "uppercase",
      color: "var(--accent-brand)"
    }
  }, "skill " + index), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "var(--label-size)",
      color: statusColor
    }
  }, status)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--display)",
      fontSize: "var(--h3-size)",
      fontWeight: 800,
      letterSpacing: "-.025em",
      marginTop: "10px"
    }
  }, question), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "14px",
      fontWeight: 200,
      color: "var(--ink-4)",
      marginTop: "6px"
    }
  }, method), chart, caption && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--mono)",
      fontSize: "var(--label-size)",
      color: "var(--ink-3)",
      marginTop: "8px"
    }
  }, caption));
}
Object.assign(__ds_scope, { TrackPanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/nav/TrackPanel.jsx", error: String((e && e.message) || e) }); }

// components/vote/BallotControls.jsx
try { (() => {
/* Three equal cells on the panel's bottom edge. Hover raises contrast to ink,
   press raises it again to brand lime. 44px minimum height. */
function BallotControls({
  onVote,
  options = [{
    id: "A",
    label: "a"
  }, {
    id: "B",
    label: "b"
  }, {
    id: "tie",
    label: "neither"
  }]
}) {
  const [hot, setHot] = React.useState(null);
  const [down, setDown] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", {
    role: "group",
    "aria-label": "Ballot",
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(" + options.length + ",1fr)",
      borderTop: "var(--border)"
    }
  }, options.map((o, i) => {
    const pressed = down === o.id,
      over = hot === o.id;
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      onClick: () => onVote && onVote(o.id),
      onMouseEnter: () => setHot(o.id),
      onMouseLeave: () => {
        setHot(null);
        setDown(null);
      },
      onMouseDown: () => setDown(o.id),
      onMouseUp: () => setDown(null),
      style: {
        fontFamily: "var(--mono)",
        fontSize: "13px",
        padding: "15px 6px",
        cursor: "pointer",
        border: 0,
        borderLeft: i ? "var(--border)" : 0,
        background: pressed ? "var(--accent-brand)" : "transparent",
        color: pressed ? "var(--canvas)" : over ? "var(--ink)" : "var(--ink-4)",
        transition: "background var(--motion-state),color var(--motion-state)"
      }
    }, o.label);
  }));
}
Object.assign(__ds_scope, { BallotControls });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/vote/BallotControls.jsx", error: String((e && e.message) || e) }); }

// components/vote/Joke.jsx
try { (() => {
/* A joke, set in Sora light italic. Nothing else on any screen is italic, so the
   typeface switch is how a reader knows this is the corpus and not our writing. */
function Joke({
  children,
  size = "var(--joke-size)"
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--body)",
      fontWeight: 200,
      fontStyle: "italic",
      fontSize: size,
      lineHeight: "var(--joke-leading)",
      color: "#d6d4cf",
      marginTop: "6px"
    }
  }, children);
}
Object.assign(__ds_scope, { Joke });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/vote/Joke.jsx", error: String((e && e.message) || e) }); }

// components/vote/Bout.jsx
try { (() => {
/* Two concealed panels stacked inside one frame, divided by a hairline. Authors
   are never shown here, only in the reveal. */
function Bout({
  a,
  b,
  labelA = "a",
  labelB = "b"
}) {
  const tag = {
    fontFamily: "var(--mono)",
    fontSize: "var(--label-size)",
    letterSpacing: ".14em",
    textTransform: "uppercase",
    color: "var(--ink-3)"
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--panel-body-pad)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: tag
  }, labelA), /*#__PURE__*/React.createElement(__ds_scope.Joke, null, a), /*#__PURE__*/React.createElement("div", {
    style: {
      height: "1px",
      background: "var(--rule)",
      margin: "16px 0"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: tag
  }, labelB), /*#__PURE__*/React.createElement(__ds_scope.Joke, null, b));
}
Object.assign(__ds_scope, { Bout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/vote/Bout.jsx", error: String((e && e.message) || e) }); }

// components/vote/Reveal.jsx
try { (() => {
/* Post-ballot disclosure. Hidden until a vote lands, then announced politely.
   Model names come in lime because the reveal is the payoff, not a datum. */
function Reveal({
  open,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    "aria-live": "polite",
    style: {
      display: open ? "block" : "none",
      borderTop: "var(--border)",
      background: "var(--surface)",
      padding: "var(--panel-foot-pad)",
      fontFamily: "var(--mono)",
      fontSize: "var(--caption-size)",
      color: "var(--ink-2)",
      lineHeight: 1.7
    }
  }, open ? children : null);
}
Object.assign(__ds_scope, { Reveal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/vote/Reveal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lolbench_site/Charts.jsx
try { (() => {
const {
  Panel,
  Scatter,
  Heatmap,
  DotMatrix,
  BarList
} = window.LOLBenchDesignSystem_ab2c27;
function Charts({
  data
}) {
  const points = data.scored.map(m => ({
    label: m.name,
    x: m.x,
    y: m.y,
    lo: m.lo,
    hi: m.hi,
    leader: m.leader,
    thin: m.thin,
    dy: m.name === "glm-5.3-flash" ? 20 : m.name === "grok-4.6" ? 22 : m.name === "hy3" ? 20 : 4
  }));
  const matrix = [...data.scored].sort((a, b) => b.n - a.n).slice(0, 5).map(m => ({
    label: m.name,
    n: m.n
  })).concat([{
    label: data.unrankable[0].name,
    n: data.unrankable[0].n
  }]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "26px"
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    size: "lg",
    title: "Score against cost",
    meta: "dots are models \xB7 the orange bar is the range \xB7 lime = best in its price tier",
    pad: false,
    caption: "Paying more has not bought a better sense of humor yet: the best model on the board runs for nothing. Grok's 92.5 comes with the most data of anyone, 267 answers for $0.38; gpt-5.6-sol-pro's 75.0 comes from four."
  }, /*#__PURE__*/React.createElement(Scatter, {
    points: points,
    rule: {
      at: 95.8,
      label: "best score so far: 95.8, and it costs nothing"
    }
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "How much data is behind each number",
    meta: "one square = 10 graded answers \xB7 partial square = fewer than 10",
    caption: "Grok's 92.5 rests on 267 graded answers. gpt-5.6-sol-pro's 75.0 rests on four, and qwen3.8-flash's perfect 100 rests on three. Orange means the sample is too thin."
  }, /*#__PURE__*/React.createElement(DotMatrix, {
    rows: matrix
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Which kinds of joke they miss",
    meta: "the dataset sorts jokes into six mechanisms, F1 to F6",
    caption: /*#__PURE__*/React.createElement(React.Fragment, null, "Everyone is near perfect on five of the six and falls apart on ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--accent-distrust)"
      }
    }, "F6"), ": grok drops to 62, claude to 79, gemini to 25, hy3 to zero. Dark cells mean that model has not been given jokes of that kind yet.")
  }, /*#__PURE__*/React.createElement(Heatmap, {
    columns: data.mechanisms,
    warnColumn: "F6",
    rows: data.mechanismRows
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Who has written their jokes",
    meta: "jokes written of 348",
    caption: "348 jokes each is a full set. Grok understands jokes better than almost anyone and has written 19."
  }, /*#__PURE__*/React.createElement(BarList, {
    target: 348,
    rows: data.written
  })));
}
Object.assign(window, {
  Charts
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lolbench_site/Charts.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lolbench_site/Sidebar.jsx
try { (() => {
const {
  Panel,
  Standings,
  ScoreCell,
  Bout,
  BallotControls,
  Reveal,
  StatusChip
} = window.LOLBenchDesignSystem_ab2c27;
function VotePanel({
  bouts
}) {
  const [i, setI] = React.useState(0);
  const [ballot, setBallot] = React.useState(null);
  const bout = bouts[i % bouts.length];
  const cast = id => {
    if (ballot) return;
    setBallot(id);
    window.setTimeout(() => {
      setBallot(null);
      setI(n => n + 1);
    }, 2800);
  };
  React.useEffect(() => {
    const onKey = e => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT") return;
      const k = e.key.toLowerCase();
      if (k === "a") cast("a");else if (k === "b") cast("b");else if (k === "t") cast("neither");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });
  return /*#__PURE__*/React.createElement(Panel, {
    title: "Which one is funnier?",
    meta: /*#__PURE__*/React.createElement(StatusChip, {
      tone: "ink"
    }, "authors hidden"),
    pad: false
  }, /*#__PURE__*/React.createElement(Bout, {
    key: bout.id,
    a: bout.a,
    b: bout.b
  }), /*#__PURE__*/React.createElement(BallotControls, {
    onVote: cast
  }), /*#__PURE__*/React.createElement(Reveal, {
    open: !!ballot
  }, ballot ? /*#__PURE__*/React.createElement(React.Fragment, null, "Ballot to ", ballot, ". Panel a was ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--accent-brand)"
    }
  }, bout.modelA), ", panel b was ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--accent-brand)"
    }
  }, bout.modelB), ".", " ", bout.ballots ? "Ballots on this pair to date: " + bout.ballots + "." : "Yours is the first ballot that touches these two.", " Authors re-conceal for the next voter.") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "var(--border)",
      padding: "var(--panel-foot-pad)",
      fontFamily: "var(--mono)",
      fontSize: "var(--caption-size)",
      color: "var(--ink-3)"
    }
  }, bout.id + " · premise " + bout.premise + " · " + bout.ballots + " ballots on this pair"));
}
function Sidebar({
  data
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gap: "26px",
      alignContent: "start"
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Standings",
    meta: "lime = best in its price tier",
    pad: false
  }, /*#__PURE__*/React.createElement(Standings, {
    rows: data.scored.map(m => ({
      label: m.name,
      leader: m.leader,
      score: /*#__PURE__*/React.createElement(ScoreCell, {
        value: m.y,
        plusMinus: (m.hi - m.lo) / 2
      })
    })),
    unranked: data.unrankable.map(m => ({
      label: m.name,
      score: /*#__PURE__*/React.createElement(ScoreCell, {
        value: m.y,
        on: m.n
      })
    })),
    footer: data.unrankable[0].name + " scored 100.0 on three answers: too thin to rank, so it sits outside the table. " + data.pending + " more models are still being judged."
  })), /*#__PURE__*/React.createElement(VotePanel, {
    bouts: data.bouts
  }));
}
Object.assign(window, {
  Sidebar,
  VotePanel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lolbench_site/Sidebar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lolbench_site/SiteApp.jsx
try { (() => {
const {
  Topbar,
  Footer,
  Kicker,
  Headline,
  Lede,
  StatBand,
  Panel
} = window.LOLBenchDesignSystem_ab2c27;
function SiteApp() {
  const data = window.LOLB;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Topbar, {
    current: "scores",
    stamp: data.stamp,
    nav: [{
      label: "scores"
    }, {
      label: "vote"
    }, {
      label: "the jokes"
    }, {
      label: "how it works"
    }, {
      label: "github",
      href: "https://github.com/YakshithK/lolbench"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    className: "wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rv",
    style: {
      display: "grid",
      gridTemplateColumns: "1.25fr 1fr",
      gap: "56px",
      alignItems: "end",
      padding: "var(--hero-pad)",
      borderBottom: "var(--border)"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Kicker, null, "wave 00 / open results"), /*#__PURE__*/React.createElement(Headline, null, "Fifteen models walk", /*#__PURE__*/React.createElement("br", null), "into a bar."), /*#__PURE__*/React.createElement(Lede, null, "Ten of them explained the bar. We are measuring which ones can also be funny.")), /*#__PURE__*/React.createElement(Panel, {
    title: "Best line written so far",
    meta: "author concealed until you vote",
    caption: /*#__PURE__*/React.createElement(React.Fragment, null, data.bouts[0].id + " · " + data.bouts[0].ballots + " ballots on this pair")
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--body)",
      fontWeight: 200,
      fontStyle: "italic",
      fontSize: "18px",
      lineHeight: 1.45,
      color: "#d6d4cf"
    }
  }, data.bouts[0].b))), /*#__PURE__*/React.createElement(Tracks, {
    data: data
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "var(--main-cols)",
      gap: "var(--gap-panel)",
      paddingTop: "30px"
    }
  }, /*#__PURE__*/React.createElement(Charts, {
    data: data
  }), /*#__PURE__*/React.createElement(Sidebar, {
    data: data
  })), /*#__PURE__*/React.createElement(StatBand, {
    stats: [{
      label: "jokes in the set",
      value: "150",
      note: "written and checked by hand, three passes each"
    }, {
      label: "who grades",
      value: "2 models",
      note: "from other labs, never the one being graded"
    }, {
      label: "who decides funny",
      value: "you do",
      note: "no model ever rates a punchline"
    }, {
      label: "total cost",
      value: "$6.37",
      note: "every run disclosed, cap $7.00"
    }]
  })), /*#__PURE__*/React.createElement(Footer, null));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(SiteApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lolbench_site/SiteApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lolbench_site/Tracks.jsx
try { (() => {
const {
  TrackPanel,
  Sparkline
} = window.LOLBenchDesignSystem_ab2c27;
function Tracks({
  data,
  onVote
}) {
  const bars = [{
    label: data.unrankable[0].name,
    value: data.unrankable[0].y,
    thin: true
  }, ...data.scored.map(m => ({
    label: m.name,
    value: m.y,
    leader: m.leader,
    thin: m.thin
  }))];
  const written = data.written.map(w => ({
    label: w.label,
    value: w.value,
    thin: w.value < 40
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "1px",
      background: "var(--rule)",
      border: "var(--border)",
      marginTop: "30px"
    }
  }, /*#__PURE__*/React.createElement(TrackPanel, {
    index: "01",
    status: data.scored.length + 1 + " of 15 scored",
    question: "Does it get the joke?",
    method: "It explains why a joke works. We check that against notes a human wrote.",
    chart: /*#__PURE__*/React.createElement(Sparkline, {
      bars: bars,
      pending: data.pending
    }),
    caption: "one bar per model, best first \xB7 lime = best in its price tier \xB7 orange = too thin to trust \xB7 dark = still being judged"
  }), /*#__PURE__*/React.createElement(TrackPanel, {
    index: "02",
    status: "you are the judge",
    statusTone: "ink",
    question: "Can it land one?",
    method: "Two models write on the same setup. Humans pick the funnier line, blind.",
    chart: /*#__PURE__*/React.createElement(Sparkline, {
      min: 0,
      max: 348,
      bars: written
    }),
    caption: "jokes written per model \xB7 348 is a full set \xB7 1,699 pairs formed"
  }), /*#__PURE__*/React.createElement(TrackPanel, {
    index: "03",
    status: "next data drop",
    statusTone: "quiet",
    question: "Does it laugh with us?",
    method: "It ranks 1,500 jokes best to worst. We compare its ranking to ours.",
    chart: /*#__PURE__*/React.createElement("div", {
      style: {
        height: "56px",
        marginTop: "14px",
        border: "1px dashed var(--rule-2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--mono)",
        fontSize: "11px",
        color: "var(--ink-3)"
      }
    }, "no data yet"),
    caption: "cheapest skill to test \xB7 no benchmark covers it"
  }));
}
Object.assign(window, {
  Tracks
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lolbench_site/Tracks.jsx", error: String((e && e.message) || e) }); }

// ui_kits/lolbench_site/data.js
try { (() => {
/* Real data from site/results.json and mockups/e-instrument.html in
   YakshithK/lolbench@master. Scores are the lol_a means as percentages, ranges
   are the ci95 bounds, spends and bout counts are the repo's own. */
window.LOLB = {
  stamp: "v0.1.0 · 15 models · $6.37 spent",
  scored: [{
    name: "muse-spark-1.2",
    lab: "Meta",
    x: 0,
    y: 95.83,
    lo: 87.50,
    hi: 100,
    n: 24,
    leader: true
  }, {
    name: "gemini-3.1-pro",
    lab: "Google",
    x: 1.94,
    y: 95.45,
    lo: 89.39,
    hi: 100,
    n: 33,
    leader: true
  }, {
    name: "glm-5.3-flash",
    lab: "Z.ai",
    x: 0,
    y: 94.74,
    lo: 84.21,
    hi: 100,
    n: 19
  }, {
    name: "grok-4.6",
    lab: "xAI",
    x: 0.38,
    y: 92.51,
    lo: 89.70,
    hi: 95.32,
    n: 267
  }, {
    name: "claude-opus-5",
    lab: "Anthropic",
    x: 1.18,
    y: 88.69,
    lo: 82.14,
    hi: 94.64,
    n: 84
  }, {
    name: "hy3",
    lab: "Tencent",
    x: 0,
    y: 87.50,
    lo: 62.50,
    hi: 100,
    n: 8
  }, {
    name: "hy4-preview",
    lab: "Tencent",
    x: 1.62,
    y: 85.71,
    lo: 66.67,
    hi: 100,
    n: 21
  }, {
    name: "gpt-5.6-sol-pro",
    lab: "OpenAI",
    x: 1.26,
    y: 75.00,
    lo: 25.00,
    hi: 100,
    n: 4,
    thin: true
  }, {
    name: "deepseek-v4-flash",
    lab: "DeepSeek",
    x: 0,
    y: 74.19,
    lo: 62.90,
    hi: 85.48,
    n: 31
  }],
  unrankable: [{
    name: "qwen3.8-flash",
    lab: "Alibaba",
    y: 100,
    n: 3
  }],
  pending: 5,
  mechanisms: ["F1", "F2", "F3", "F4", "F5", "F6"],
  mechanismRows: [{
    label: "grok-4.6",
    values: {
      F1: 100,
      F2: 100,
      F3: 100,
      F4: 98,
      F5: 99,
      F6: 62
    }
  }, {
    label: "claude-opus-5",
    values: {
      F5: 98,
      F6: 79
    }
  }, {
    label: "gemini-3.1-pro",
    values: {
      F1: 100,
      F4: 100,
      F6: 25
    }
  }, {
    label: "deepseek-v4-flash",
    values: {
      F1: 100,
      F2: 100,
      F3: 100,
      F4: 100,
      F6: 67
    }
  }, {
    label: "glm-5.3-flash",
    values: {
      F1: 92,
      F2: 100,
      F3: 100
    }
  }, {
    label: "hy3",
    values: {
      F1: 100,
      F2: 100,
      F3: 100,
      F6: 0
    }
  }],
  written: [{
    label: "glm-5.3-flash",
    value: 348
  }, {
    label: "deepseek-v4-pro",
    value: 348
  }, {
    label: "hy3",
    value: 348
  }, {
    label: "mimo-v2.5-pro",
    value: 348
  }, {
    label: "qwen3.8-flash",
    value: 348
  }, {
    label: "qwen3.8-max",
    value: 348
  }, {
    label: "glm-5.3",
    value: 340
  }, {
    label: "mimo-v2.5",
    value: 340
  }, {
    label: "gpt-5.6-sol-pro",
    value: 334
  }, {
    label: "deepseek-v4-flash",
    value: 192
  }, {
    label: "hy4-preview",
    value: 85
  }, {
    label: "grok-4.6",
    value: 19
  }],
  bouts: [{
    id: "bout 0147",
    premise: "B-W0-015",
    ballots: 214,
    modelA: "qwen3.8-max",
    modelB: "mimo-v2.5-pro",
    a: "“A standing desk that has never once been lowered is like the office gym membership: everyone assumes it’s being used, but it’s mostly just holding a monitor.”",
    b: "“That standing desk has never been lowered; it’s like our open door policy that somehow never applies to raises.”"
  }, {
    id: "bout 0148",
    premise: "B-W0-022",
    ballots: 0,
    modelA: "glm-5.3",
    modelB: "deepseek-v4-pro",
    a: "“The all-hands slide said we are a family, which explains the inheritance dispute over the good conference room.”",
    b: "“They called it a family meeting, then scheduled it for 7pm, which is the most family thing about it.”"
  }, {
    id: "bout 0149",
    premise: "B-W0-008",
    ballots: 6,
    modelA: "hy3",
    modelB: "gpt-5.6-sol-pro",
    a: "“My smart fridge sends me a weekly report. It has more opinions about my diet than my doctor and fewer qualifications than my dog.”",
    b: "“The fridge now emails me. I have started replying, which my therapist says is progress in the wrong direction.”"
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/lolbench_site/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.Mark = __ds_scope.Mark;

__ds_ns.Topbar = __ds_scope.Topbar;

__ds_ns.Wordmark = __ds_scope.Wordmark;

__ds_ns.BarList = __ds_scope.BarList;

__ds_ns.DotMatrix = __ds_scope.DotMatrix;

__ds_ns.Heatmap = __ds_scope.Heatmap;

__ds_ns.RankChip = __ds_scope.RankChip;

__ds_ns.Scatter = __ds_scope.Scatter;

__ds_ns.ScoreCell = __ds_scope.ScoreCell;

__ds_ns.Sparkline = __ds_scope.Sparkline;

__ds_ns.SpendCell = __ds_scope.SpendCell;

__ds_ns.Standings = __ds_scope.Standings;

__ds_ns.Headline = __ds_scope.Headline;

__ds_ns.Kicker = __ds_scope.Kicker;

__ds_ns.Lede = __ds_scope.Lede;

__ds_ns.StatBand = __ds_scope.StatBand;

__ds_ns.StatusChip = __ds_scope.StatusChip;

__ds_ns.DefenseRows = __ds_scope.DefenseRows;

__ds_ns.Panel = __ds_scope.Panel;

__ds_ns.PendingLine = __ds_scope.PendingLine;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.TrackPanel = __ds_scope.TrackPanel;

__ds_ns.BallotControls = __ds_scope.BallotControls;

__ds_ns.Bout = __ds_scope.Bout;

__ds_ns.Joke = __ds_scope.Joke;

__ds_ns.Reveal = __ds_scope.Reveal;

})();

/* Builds window.LOLB from the real, live data files before the design
   system's React components mount. Replaces the prototype's static data.js,
   which shipped a stale, partly-invented snapshot (pre-fix scores, fabricated
   ballot counts). Synchronous XHR is used deliberately: React/Babel scripts
   below this one execute in document order and read window.LOLB at render
   time, so the data must be ready before they run. */
(function () {
  function getJSON(url) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false); // sync: this file's only job is to block until data is ready
    xhr.send(null);
    if (xhr.status !== 200) return null;
    try { return JSON.parse(xhr.responseText); } catch (e) { return null; }
  }

  var LABS = {
    "glm-5.3-flash": "Z.ai", "deepseek-v4-flash": "DeepSeek", "hy3": "Tencent",
    "mimo-v2.5": "Xiaomi", "qwen3.8-flash": "Alibaba", "glm-5.3": "Z.ai",
    "deepseek-v4-pro": "DeepSeek", "qwen3.8-max": "Alibaba", "mimo-v2.5-pro": "Xiaomi",
    "gpt-5.6-sol-pro": "OpenAI", "gemini-3.1-pro": "Google",
    "claude-opus-5": "Anthropic", "muse-spark-1.2": "Meta", "grok-4.6": "xAI"
  };
  var MIN_N = 10; // rankable floor, matches harness/score.py's published spec
  var THIN_N = 30; // matches score.py's own Wilson-floor cutoff for small-n CIs

  var results = getJSON("./results.json") || {};
  var matchups = getJSON("./matchups.json") || [];
  var lolA = results.lol_a || {};
  var spend = results.spend || {};

  var models = Object.keys(lolA);
  var rankable = [];
  var unrankable = [];
  models.forEach(function (name) {
    var s = lolA[name];
    var row = {
      name: name, lab: LABS[name] || "",
      y: Math.round(s.mean * 1000) / 10,
      lo: Math.round(s.ci95[0] * 1000) / 10,
      hi: Math.round(s.ci95[1] * 1000) / 10,
      n: s.n_scored,
      x: Object.prototype.hasOwnProperty.call(spend, name) ? spend[name] : undefined,
      thin: s.n_scored < THIN_N
    };
    if (s.n_scored >= MIN_N) rankable.push(row); else unrankable.push(row);
  });
  rankable.sort(function (a, b) { return b.y - a.y; });

  // "leader" = single best comprehension score. There's no genuine free tier
  // to split on anymore: every model now carries a real (if estimated) cost,
  // so a free-vs-paid leader split would be comparing a model against itself.
  var bestOverall = [...rankable].sort(function (a, b) { return b.y - a.y; })[0];
  rankable.forEach(function (r) { r.leader = bestOverall && r.name === bestOverall.name; });

  var mechanisms = ["F1", "F2", "F3", "F4", "F5", "F6"];
  var mechanismRows = rankable.map(function (r) {
    var fam = lolA[r.name].families || {};
    var values = {};
    mechanisms.forEach(function (f) { values[f] = fam[f] ? Math.round(fam[f].mean * 100) : null; });
    return { label: r.name, values: values };
  });

  // LOL-B: non-empty jokes actually written, out of the real wave-0 set size.
  var written = [];
  var b = results.lol_b || {};
  (b.per_model_written || []).forEach(function (w) { written.push(w); });
  // per_model_written isn't in the current results.json contract; derive from
  // matchups instead so this stays correct without a harness change.
  if (!written.length) {
    // Count DISTINCT premises per model, not matchup appearances: a model
    // that wrote one joke shows up in one matchup per rival model on that
    // same premise, so counting appearances overcounts by roughly 14x.
    var premisesByModel = {};
    matchups.forEach(function (m) {
      [m.model_a, m.model_b].forEach(function (name) {
        (premisesByModel[name] || (premisesByModel[name] = {}))[m.premise_id] = true;
      });
    });
    written = Object.keys(premisesByModel).map(function (name) {
      return { label: name, value: Object.keys(premisesByModel[name]).length };
    });
    written.sort(function (x, y) { return y.value - x.value; });
  }

  // Display-layer formatting normalizer (Lower-Ad-6293's launch ask): models
  // lean on em dashes, !!! and ALL-CAPS shouting to signal "punchline happened",
  // which partially unblinds the anonymous vote. Strip the crutches at render
  // time only - stored rows stay exactly as generated, and periods, commas,
  // question marks and line breaks are kept because punctuation can BE the
  // timing. Applies identically to human-written probe jokes so content
  // competes with content.
  function normalizeJoke(t) {
    if (typeof t !== "string") return t;
    var s = t;
    s = s.replace(/\s*-{2,}\s*/g, ", ");   // -- / --- → comma
    s = s.replace(/\s*[—–]\s*/g, ", ");    // em/en dash → comma
    s = s.replace(/!{2,}/g, "!");          // !!! → !
    s = s.replace(/\?{2,}/g, "?");         // ?? → ? (same crutch family)
    s = s.replace(/([!?])\s*,\s*/g, "$1 "); // no comma after ?/! (dash opened a line)
    // keep real initialisms: a corpus-derived list plus the consonant-only
    // catch-all (GPS, GDP, RSVP); everything else is shouting → normal case.
    // Multi-word runs ("NO WAY") downcase together so they can't half-convert.
    var keep = function (w) {
      return /^(ETA|GPS|PIN|GPA|CEO|REM|RSVP|CFO|ROI|GDP|FBI|EMT|USSR|TIL|NASA|USA|UFO|LOL|LMAO|ROFL|BRB|YOLO|TGIF|ASAP|FOMO)$/.test(w) || /^[^AEIOUaeiou]+$/.test(w);
    };
    var down = function (w) { return keep(w) ? w : w.charAt(0) + w.slice(1).toLowerCase(); };
    s = s.replace(/\b[A-Z]{2,}(?:\s+[A-Z]{2,})+\b/g, function (run) { return run.split(/\s+/).map(down).join(" "); });
    s = s.replace(/\b[A-Z]{3,}\b/g, down);
    s = s.replace(/,\s*,/g, ",");          // collapse commas doubled by dash swaps
    s = s.replace(/,\s*([.!?])/g, "$1");   // no comma right before sentence end
    s = s.replace(/,\s*$/gm, "");          // no trailing comma where a dash closed a line
    s = s.replace(/^,\s*/gm, "");          // no leading comma where a dash opened a line
    s = s.replace(/ {2,}/g, " ");          // collapse spacing left by the swap
    return s;
  }

  // True Fisher-Yates shuffle. The old deterministic "(i * 2654435761) % (i + 1)"
  // permutation never moves element 0 (j can only be 0 when i+1 divides the
  // constant, which never happens), so the first file entry opened the booth
  // for every visitor, every visit - 10 of the first 12 probe ballots landed
  // on one pair because of it.
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  var bouts = matchups.map(function (m) {
    return { id: m.matchup_id, premise: m.premise_id, modelA: m.model_a, modelB: m.model_b, a: normalizeJoke(m.a), b: normalizeJoke(m.b), ballots: 0, kind: "b" };
  });
  shuffle(bouts);

  // LOL-C honeypot probes: human-written Reddit pairs with a recorded crowd
  // winner, served blind inside the normal rotation (~1 probe per 5 bouts).
  // Every visitor vote on one is a free human-vs-crowd data point for the
  // taste-ceiling question. Probe votes carry kind:"c" and are excluded from
  // model standings by construction (standings render from data.scored, and
  // the vote path tags every row). UI stays identical until the reveal.
  var rawProbes = getJSON("./c_probes.json") || [];
  shuffle(rawProbes);
  var probeBouts = rawProbes.map(function (p) {
    return { id: p.id, premise: null, modelA: null, modelB: null, a: normalizeJoke(p.joke_a), b: normalizeJoke(p.joke_b), ballots: 0, kind: "c", winner: p.winner, year: p.year };
  });
  if (probeBouts.length) {
    var mixed = [];
    var qi = 0;
    bouts.forEach(function (bout, idx) {
      mixed.push(bout);
      if ((idx + 1) % 4 === 0 && qi < probeBouts.length) { mixed.push(probeBouts[qi]); qi++; }
    });
    while (qi < probeBouts.length) { mixed.push(probeBouts[qi]); qi++; }
    bouts = mixed;
  }

  var totalSpend = 0;
  Object.keys(spend).forEach(function (k) { totalSpend += spend[k]; });

  var itemsCount = models.length ? lolA[models[0]].items : 150;
  var jv = results.judge_validity || {};

  window.LOLB = {
    stamp: "v" + (results.dataset_version || "0.0.0") + " · " + models.length + " models · ~$" + totalSpend.toFixed(2) + " est. cost",
    itemsCount: itemsCount,
    totalSpend: totalSpend,
    judgeDistance: jv.mean_abs_distance_pts != null ? jv.mean_abs_distance_pts : null,
    judgeCorrelation: jv.correlation != null ? jv.correlation : null,
    judgePairs: jv.n_pairs || 0,
    scored: rankable,
    unrankable: unrankable,
    pending: 0, // every currently-enabled candidate is present in lolA; nothing mid-run right now
    mechanisms: mechanisms,
    mechanismRows: mechanismRows,
    written: written,
    bouts: bouts.length ? bouts : [{ id: "no bouts yet", premise: "—", modelA: "—", modelB: "—", a: "Bouts publish once wave-0 generation lands.", b: "…", ballots: 0, kind: "b" }],
    costEstimated: true // every figure in `spend` is derived (see harness/score.py spend_by_model), never metered
  };

  // Best-effort real ballot counts; leaves ballots:0 if the API isn't reachable.
  try {
    var lb = getJSON("/api/leaderboard");
    if (Array.isArray(lb)) {
      var byId = {};
      lb.forEach(function (row) { byId[row.matchup_id] = (row.wins_a || 0) + (row.wins_b || 0) + (row.ties || 0) + (row.neithers || 0); });
      window.LOLB.bouts.forEach(function (bout) {
        if (byId[bout.id] != null) bout.ballots = byId[bout.id];
      });
    }
  } catch (e) { /* leaderboard API not configured locally; ballots stay 0 */ }
})();

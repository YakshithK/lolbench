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
    "hy4-preview": "Tencent", "gpt-5.6-sol-pro": "OpenAI", "gemini-3.1-pro": "Google",
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

  // "leader" = best score within its price tier, where the tier is known.
  // Models with no logged cost at all (see docs) sit outside either tier and
  // are excluded from cost framing rather than guessed at.
  var free = rankable.filter(function (r) { return r.x === 0; });
  var paid = rankable.filter(function (r) { return typeof r.x === "number" && r.x > 0; });
  var bestFree = free.sort(function (a, b) { return b.y - a.y; })[0];
  var bestPaid = paid.sort(function (a, b) { return b.y - a.y; })[0];
  rankable.forEach(function (r) {
    r.leader = (bestFree && r.name === bestFree.name) || (bestPaid && r.name === bestPaid.name);
  });

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

  var bouts = matchups.map(function (m) {
    return { id: m.matchup_id, premise: m.premise_id, modelA: m.model_a, modelB: m.model_b, a: m.a, b: m.b, ballots: 0 };
  });
  // Deterministic shuffle so repeat visits don't always open on the same pair,
  // without needing Math.random at module scope before React mounts.
  for (var i = bouts.length - 1; i > 0; i--) {
    var j = (i * 2654435761) % (i + 1);
    var t = bouts[i]; bouts[i] = bouts[j]; bouts[j] = t;
  }

  var totalSpend = 0;
  Object.keys(spend).forEach(function (k) { totalSpend += spend[k]; });

  var itemsCount = models.length ? lolA[models[0]].items : 150;

  window.LOLB = {
    stamp: "v" + (results.dataset_version || "0.0.0") + " · " + models.length + " models · $" + totalSpend.toFixed(2) + " logged",
    itemsCount: itemsCount,
    totalSpend: totalSpend,
    scored: rankable,
    unrankable: unrankable,
    pending: Math.max(0, 15 - models.length),
    mechanisms: mechanisms,
    mechanismRows: mechanismRows,
    written: written,
    bouts: bouts.length ? bouts : [{ id: "no bouts yet", premise: "—", modelA: "—", modelB: "—", a: "Bouts publish once wave-0 generation lands.", b: "…", ballots: 0 }],
    excludedFromCost: models.filter(function (m) { return !Object.prototype.hasOwnProperty.call(spend, m); })
  };

  // Best-effort real ballot counts; leaves ballots:0 if the API isn't reachable.
  try {
    var lb = getJSON("/api/leaderboard");
    if (Array.isArray(lb)) {
      var byId = {};
      lb.forEach(function (row) { byId[row.matchup_id] = (row.wins_a || 0) + (row.wins_b || 0) + (row.ties || 0); });
      window.LOLB.bouts.forEach(function (bout) {
        if (byId[bout.id] != null) bout.ballots = byId[bout.id];
      });
    }
  } catch (e) { /* leaderboard API not configured locally; ballots stay 0 */ }
})();

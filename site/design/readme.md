# LOL Bench Design System

**LOL Bench** is a benchmark for whether large language models can appreciate, produce, and discriminate humor. It measures three separable skills: whether a model can explain why a joke works, whether it can write one that makes humans laugh, and whether its taste matches ours. The product is one page at `lolbench.lol` plus serverless functions; the whole benchmark reruns via three commands (`run.py` → `judge.py` → `score.py`).

The design brief comes from the project's own posture: publish the error bars, keep the caveats visible, and let the dissociation between the three skills be the finding. The system that does that here is **a dark console that shows its work** — charts first, plain language, and one glyph that carries both halves of the name.

## Sources this system was built from

| Source | What was taken |
|---|---|
| [github.com/YakshithK/lolbench](https://github.com/YakshithK/lolbench) (branch `master`) | Everything below |
| `site/results.json` | Real scores, ci95 bounds, answer counts, mechanism families (F1–F6) |
| `mockups/e-instrument.html` | Bout texts, per-model bout counts, spends |
| `site/index.html` | The production page's data flow and vote loop |
| `docs/07-design-system.md` | The v1 spec. Its *rules* (error bars mandatory, cost beside every score, closed status vocabulary, in-progress as a designed state) are honoured; its *aesthetic* (white canvas, Libre Franklin, laugh-cry palette) was replaced at the owner's direction |
| `README.md`, `docs/01-vision.md` | Product context, origin, voice |

Read those repositories directly if you have access: `site/results.json` is the live data contract, and `docs/07-design-system.md` records what v1 believed.

**Deliberate departure from the source spec.** v1 mandated a white canvas, no color zones, and a laugh-cry yellow/blue/red palette. The owner judged it "basic" and hard to read, and asked for a rewrite with real graphs, plain language, and less required background knowledge. This system is that rewrite. What survived from v1: a score never ships without its range, cost sits beside every score, nothing grades itself, and "not yet" is always a designed state.

---

## CONTENT FUNDAMENTALS

**Plain language is the rule, not a preference.** If a reader would have to look a term up, it gets rewritten. The terms are still true — they just live in a caption instead of a headline.

| Not this | This |
|---|---|
| Comprehension under a dual-judge protocol | Does it get the joke? |
| Constrained generation, pairwise preference | Can it land one? |
| Rank correlation against human-rated pools | Does it laugh with us? |
| n=3, CI [1.0, 1.0] | 100.0 on three answers: too thin to rank |
| Judge family disjointness enforced | Nothing grades itself |

**The humor is carried by the subject, not the interface.** The page never jokes about itself; it shows real jokes at reading size and states findings flatly. Headlines work as a setup with the payoff in the deck: "Fifteen models walk into a bar." / "Ten of them explained the bar."

**Casing and voice.** Sentence case for anything a human reads. Lowercase mono for chrome — nav labels, status chips, stamps, captions. Model names are lowercase verbatim identifiers (`claude-opus-5`) and never title-cased. No exclamation marks, no self-praise, no em dashes (use a colon, a comma, or the middot `·`).

**Person.** Second person only where the reader acts: "you are the judge", "which one is funnier?". Otherwise the protocol is the subject, not the team.

**Numbers.** Mono and tabular, always. Means at one decimal, uncertainty as `±x.x`, cost as `$X.XX` or `free`, coverage as `n of target`. **A number never appears without its range or its answer count.** A perfect score on three answers is displayed as `100.0 on 3` and excluded from the ranking, with the reason stated in the table footer.

**Arithmetic must reconcile.** If the page says 15 models, then ranked + unrankable + being judged has to equal 15, visibly. A reader will check.

**Findings, not adjectives.** Every chart caption states what the chart shows: "Paying more has not bought a better sense of humor yet." "Grok understands jokes better than almost anyone and has written 19." If you can't write that sentence, the chart isn't ready.

**No emoji.** The v1 spec allowed one 😂 in three slots; this system has a real mark instead and uses none.

---

## VISUAL FOUNDATIONS

**The canvas is engraved, not flat.** `#07080a` with a 56px grid drawn one step above black (`#0f1216`). Panels sit on it in near-black glass (`rgba(12,14,17,.92)`) with hairline borders. Nothing is pure black or pure white.

**Two hexes, four jobs, all named.** Lime `#d4ff4f` splits into two tokens that share a value on purpose: `--accent-brand` is decoration (the mark, kickers, section eyebrows, status chips, links) and never sits on a datum; `--accent-leader` is earned by a number (best in its price tier, top of a sequential scale). Orange `#ff5c3a` is `--accent-distrust`: thin samples, wide ranges, zeroes. If a future theme needs to separate brand from leader, one token changes and the charts stay honest.

**Completion is never lime.** Finishing an assigned set is not winning, so progress bars are neutral. This distinction was the single most common defect during the build.

**A zero is a failure, not a low score.** The sequential scale runs olive to lime for values; a true zero is drawn in orange, and an *absent* value is an empty well cell (`#14181c`). Never fill an absent cell with a zero or a dash — the difference between "asked and failed" and "not asked yet" is the point.

**Ink has a hard floor.** `--ink #eceae5` for body and headlines, `--ink-2 #a2a8b0` for secondary and neutral data, `--ink-3 #8a9299` for captions (6.3:1, the floor at 11px), `--ink-4 #79808a` for method lines (4.98:1, never below 12px). Nothing renders below 11px. Captions are the layer that explains every chart, so they are never the faintest text on the page.

**Type: three faces, three jobs.** Bricolage Grotesque 800 says things (headlines, panel titles, at -0.035em and 0.9 leading). Azeret Mono counts things (every number, label, stamp, status, nav item). Sora 200 explains things (ledes at 22px on a 40ch measure, method lines at 14px). Jokes are Sora 200 italic at 17px — the only italic in the system, which is how a reader knows the words are the corpus and not ours.

**Charts are the content.** Five chart types, each with one job: the score-against-cost scatter (dots are models, the vertical orange bar is the range), the mechanism heatmap (where each model collapses), the dot matrix (how much data is behind a number, one square per ten answers), completion bars, and the track sparkline. Every one sits in a panel with a caption naming its colours and its finding.

**Borders, not shadows.** Hairlines at `#191d22`, chart axes one step up at `#262c33`. `box-shadow` is never used. **Radius is 0 everywhere** — no rounded panels, no pills.

**Banded layout.** A 1300px wrap with 34px gutters. Multi-cell bands (the three tracks, the four-up method band) are 1px-gapped grids over a rule-coloured background, so the dividers are the background showing through. Panel gap is 26px. Breakpoints: 1080px (columns collapse, display type steps down) and 680px only.

**No imagery, no gradients, no texture** beyond the canvas grid. There is nothing to have a colour temperature: the only pictures are charts.

**Motion is one load reveal**: opacity 0→1 with a 6px rise over 500ms, honouring `prefers-reduced-motion`. State transitions are 120ms. Hover raises contrast to ink; press raises it again to a lime fill with canvas text; `:focus-visible` is a 2px lime outline at 2px offset, everywhere.

---

## ICONOGRAPHY

**There is one mark and no icon set.**

The mark is **an error bar with its ends turned up**: the caps are the interval, the curve is the mouth. It is the one glyph that carries both halves of the name, and it reads as a smile down to 17px tall. Lime on the canvas is primary; canvas-on-lime for avatars; single-ink white when that's all there is. Clear space is one cap height; minimum width 20px, below which the wordmark runs alone. It ships as `assets/mark.svg` and as `components/chrome/Mark.jsx`, and doubles as the favicon.

The upstream repo contained **no logo file** — only a 😂 favicon data URI. This mark was designed for the project here; nothing was recovered or approximated from elsewhere.

**Everything else is a chart element doing double duty.** A lime dot is a model. A 3px orange bar is its range. A 9px square is ten graded answers; a narrow one is fewer than ten. An olive cell is a weak mechanism. A neutral fill in a well is completion. Arrows (`→`), middots (`·`), en dashes in ranges and the ellipsis carry the rest.

**No icon font, no sprite, no PNG icons, no emoji, and no CDN icon library.** A borrowed icon set would be a visible foreign object here, so none was substituted.

---

## Index

**Root**
- `readme.md` — this file
- `styles.css` — the global entry consumers link; `@import` lines only
- `SKILL.md` — Agent Skills wrapper
- `github.md` — source repo association and screen map
- `thumbnail.html` — homepage tile
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `borders.css`, `base.css`
- `assets/` — `mark.svg` and its usage rules
- `guidelines/` — 13 foundation cards (Colors, Type, Spacing, Brand)
- `templates/` — `leaderboard/` (the full page) and `brand-kit/` (logo, type, colour spec)
- `ui_kits/lolbench_site/` — the interactive product recreation

**Components** (23, each with `.jsx`, `.d.ts`, `.prompt.md`)

| Group | Components |
|---|---|
| `components/chrome/` | `Mark`, `Wordmark`, `Topbar`, `Footer` |
| `components/head/` | `Kicker`, `Headline`, `Lede`, `StatusChip`, `StatBand` |
| `components/nav/` | `TrackPanel`, `Tabs` |
| `components/data/` | `Scatter`, `Heatmap`, `DotMatrix`, `BarList`, `Sparkline`, `Standings`, `ScoreCell`, `RankChip`, `SpendCell` |
| `components/layout/` | `Panel`, `DefenseRows`, `PendingLine` |
| `components/vote/` | `Bout`, `BallotControls`, `Reveal`, `Joke` |

Full list, alphabetical: `BallotControls`, `BarList`, `Bout`, `DefenseRows`, `DotMatrix`, `Footer`, `Headline`, `Heatmap`, `Joke`, `Kicker`, `Lede`, `Mark`, `Panel`, `PendingLine`, `RankChip`, `Reveal`, `Scatter`, `ScoreCell`, `Sparkline`, `SpendCell`, `Standings`, `StatBand`, `StatusChip`, `Tabs`, `Topbar`, `TrackPanel`, `Wordmark`.

**Why these and not a standard set.** Every component maps to something the product actually shows. There is no Modal, Toast, Avatar, Select or Switch, because LOL Bench has no such surface. `Mark`, `Heatmap`, `DotMatrix`, `BarList`, `Sparkline`, `TrackPanel`, `StatBand`, `Lede`, `Standings` and `ScoreCell` are additions from this rewrite: the source spec had no logo, and its charts were limited to a horizontal whisker bar, which is why the mechanism data in `results.json` had never been plotted.

## Known gaps

- **Fonts load from Google Fonts** via the pinned `@import` in `tokens/fonts.css`. No binaries exist upstream, so there are no local `@font-face` files. All three families are real; nothing was substituted.
- **No slide template**, because none exists upstream.
- **Skill 03 (taste) has no data**, so it renders its empty state. That is the honest state, not a gap in the design.
- **Mechanism names.** `results.json` labels the six joke mechanisms `F1`–`F6` with no names attached. The heatmap uses the labels verbatim rather than inventing names. Supply the names and the chart gets much more readable.

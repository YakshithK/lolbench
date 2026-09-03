# LOL Bench Design System — v1 (SUPERSEDED)

**Superseded 2026-09-03** by a full rewrite: a dark, chart-first console built with Claude
Design (`site/design/`, integrated into `site/index.html`). The owner judged this v1 white/serif
system too basic to read; the replacement keeps this doc's *honesty rules* (error bars mandatory,
cost beside every score, closed status vocabulary, in-progress as a designed state) but replaces
the aesthetic entirely. Source of truth going forward is `site/design/readme.md`. This file is
kept for history only — do not build new screens against it.

---

The canonical, hyper-specific rules for every LOL Bench screen. Derived from and implemented by
[`mockups/e-instrument.html`](../mockups/e-instrument.html) (the reference implementation; open it
side by side while reading). Target for production is `site/index.html`.

How to use this document: build new screens by copying the token block (§12) and the component
specs (§5) verbatim. When a rule here conflicts with taste, the rule wins. When a rule here is
missing, extend it via §10's mechanisms and update this file in the same PR.

---

## 1. Design thesis (non-negotiable)

1. **One canvas.** The page is white `#ffffff` from the topbar's top edge to the footer's bottom
   edge. There are no color zones anywhere: no dark hero bands, no tinted sidebars, no tinted
   page background. Depth comes from rules, borders, and type, never from background switches.
2. **Deadpan instrument.** The site is a measurement instrument that happens to be about jokes.
   Structure looks like serious data journalism (ruled stat strips, booktabs-ish tables, mono
   numerals). The humor is delivered by the *content* (real jokes, dry captions) inside the
   serious frame. The site never laughs at itself; it laughs exactly twice per §8.4.
3. **Every number ships with its error bar or doesn't ship.** A mean without a ± or a CI is not
   allowed on any screen. Uncertainty is always drawn in red (§2).
4. **In-progress is a designed state.** The benchmark is always mid-run somewhere. No screen may
   show an empty table, a dash, or a blank card as its data state. Use the pending/queued
   vocabulary in §8.5.
5. **The palette is the emoji.** The 😂 is the unit the benchmark measures, so its anatomy is the
   brand: laughter yellow (the face) = performance and human moments; tear blue (the droplet) =
   completion and free things; red = uncertainty and warnings. Ink and paper are the deadpan base.

---

## 2. Color tokens

| Token | Hex | Role | Allowed | Forbidden |
|---|---|---|---|---|
| `--bg` | `#ffffff` | Page canvas | The only page background | Any other page/canvas color |
| `--panel` | `#f6f5f0` | Tinted recesses | Table foot caption row, bar/track backgrounds, reveal strip | Page background, cards |
| `--ink` | `#17150f` | Primary text, structural rules, ink table header | Text, 2px rules, table header bg, hover fills | Page background |
| `--ink-2` | `#403c30` | Secondary text | Sub-paragraphs, bar fill in neutral contexts, protocol arrows | — |
| `--mut` | `#6f6a59` | Tertiary text | Captions, column labels, inactive tabs | Body copy |
| `--dim` | `#a09a87` | Quaternary text | Sublabels, meta stamps, placeholder ranks | Anything users must read |
| `--line` | `#e7e4da` | Hairline inside cards | Row separators, inner borders | Page-level structure |
| `--line-2` | `#d6d2c4` | Card outlines | Component borders, tab underline track | — |
| `--red` | `#b3261e` | Uncertainty + warnings ONLY | CI whiskers, preliminary chip, `:focus-visible` outline, "just began"/"not started" status, sort emphasis on ink | Decoration, brand accent, links, buttons (except `.ctl:active` swap in §5) |
| `--laugh` | `#ffc53d` | Performance + human moments | Highlighter mark, BENCH chip, score-bar fills, rank chips, active tab underline, scatter paid dots, `.ctl:active` fill, sort arrow on ink header, box-title ticks | Text color (contrast), page background |
| `--laugh-deep` | `#8a6a00` | Yellow for small text | Kicker, bold model names inside reveal | Backgrounds |
| `--tear` | `#2f83bd` | Completion + free | Full coverage bars | Warning, error, decoration |

Anatomy rule: a new color may only be added if it maps to a part of the joke-telling anatomy or to
a statistical meaning, and it must get a row in this table plus a rule in §9 in the same PR. Four
accents is the ceiling (laugh, laugh-deep, tear, red). No gradients: fills are flat, always.

Contrast floors: body text on `--bg` ≥ 7:1 (ink passes); `--mut` used only ≥ 12px; `--dim` only
for ≥ 12px non-essential meta; `--laugh-deep` on white ≥ 4.5:1; `--laugh` as background always
carries `--ink` text; `#f4f2ea` text on `--ink` header ≥ 7:1.

---

## 3. Typography

Stacks (Google Fonts, weights pinned):

```
--sans:'Libre Franklin',sans-serif      /* all UI and prose */
--mono:'Spline Sans Mono',ui-monospace,monospace   /* every number, label, stamp, status */
--joke:'Newsreader',Georgia,serif       /* jokes and nothing else */
```

Base: `body { font: 15.5px/1.55 var(--sans); -webkit-font-smoothing:antialiased; }`

| Role | Font | Spec |
|---|---|---|
| H1 headline | sans | weight 800, `clamp(2.3rem,5vw,3.8rem)`, line-height 1.0, letter-spacing `-0.032em`, max-width 22ch, one `em` phrase allowed (§5.3) |
| Kicker (max 1/page) | mono | 600, 0.68rem, letter-spacing 0.2em, uppercase, `--laugh-deep` |
| Hero sub | sans | 1rem/1.55, `--ink-2`, max-width 58ch, `b` = 700 `--ink` |
| Chip (prelim) | mono | 600, 0.62rem, ls 0.18em, uppercase, red border + red text |
| Stat label | mono | 500, 0.6rem, ls 0.16em, uppercase, `--mut` |
| Stat value | mono | 600, 1.3rem, tabular-nums; `small` = 400 0.68rem `--dim` |
| Tab | sans | 700, 0.88rem; `small` = mono 400 0.62rem `--dim`; inactive `--mut` |
| Table header | mono | 500, 0.63rem, ls 0.15em, uppercase, `#f4f2ea` on `--ink` |
| Model name | sans | 700, 0.92rem |
| Model sublabel | mono | 400, 0.62rem, ls 0.05em, `--dim` |
| Score | mono | 600, 1rem + `±x.x` at 0.68rem `--mut` |
| Rank | mono | 400, 0.8rem, `--dim`; top-3 chip per §5.7 |
| Badge (anchor) | mono | 400, 0.55rem, ls 0.12em, uppercase, `--mut`, 1px `--line-2` border, radius 3px |
| Box title | sans | 800, 0.84rem, 9px yellow square before it |
| Box tag | mono | 400, 0.6rem, ls 0.14em, uppercase, `--dim`, right-aligned |
| Joke | joke | italic, 1.14rem/1.5, `--ink`. Jokes are the ONLY serif italic on any screen |
| Reveal / stamp / caption | mono | 0.72rem / 0.64rem / 0.66rem, `--mut` family |
| Footer | mono | 0.64rem, ls 0.04em, `--dim`, links `--mut` |

Laws: **every comparative number is `font-variant-numeric: tabular-nums` in the mono stack.**
No font outside these three stacks, ever. Forbidden families: Inter, Roboto, Arial, system-ui,
Space Grotesk (the slop set). New type role → add a row here first, then code.

---

## 4. Layout, spacing, structure

- Content wrap: `max-width:1180px; margin:0 auto; padding:0 26px`.
- Page skeleton, in order: topbar → header (kicker, h1, sub, headfoot, statstrip, tabs) →
  tabpanel content → footer. Nothing else on a page without a new rule here.
- Rule hierarchy: **2px solid `--ink`** = page structure (topbar bottom, statstrip top, footer
  top). **1px `--line-2`** = component outlines. **1px `--line`** = rows inside components.
  Never swap these roles.
- Vertical rhythm: header padding-top 56px; statstrip margin-top 30px; tabs margin-top 30px;
  tabpanel padding 26px 0 10px; `.grid2` margin-top 22px, gap 20px; footer margin-top 52px,
  padding 18px 0 56px.
- `.grid2`: `grid-template-columns:1.35fr 1fr; gap:20px`. Breakpoints: collapse at 940px.
- All breakpoints: 940px (grid2, layout collapses), 900px (hero row stacks), 820px (statstrip
  2-col, bout referee strip), 760px (bout panels stack). No other breakpoints without a rule here.
- Separation is borders only. `box-shadow` is forbidden on this system (no blur, no float).
  Z-index: none used; if a future overlay needs one, add a rule here first.
- Radius: 3px (chips, badges), 4px (wordmark chip, kbd). Nothing rounder; no pill buttons.

---

## 5. Components

### 5.1 Topbar
White, height 58px, `border-bottom:2px solid var(--ink)`. Left: wordmark. Middle: nav. Right:
mono stamp `dataset vX · harness YYYY` in `--dim`.

Wordmark: 900, 1.08rem, `-0.02em`, ink. "LOL" plain + "BENCH" inside a yellow chip:
`background:var(--laugh); color:var(--ink); padding:2px 7px 3px; border-radius:4px`.

Nav: 600, 0.82rem, `--ink-2`, gap 22px. Links: no underline; hover = `--ink` + 2px `--line-2`
underline; current page = `--ink` + 2px ink underline with `margin-bottom:-2px` so it merges into
the topbar rule. Underlines never red or yellow in the topbar.

### 5.2 Kicker
Mono, 600, 0.68rem, ls 0.2em, uppercase, `--laugh-deep`. **Maximum one per page.** Format:
"Evidence state · scope", e.g. `Live evidence · wave 0`.

### 5.3 H1 + highlighter
One h1 per page, question form preferred, ≤ 22ch. Exactly one highlighted phrase allowed:

```
h1 em { font-style:normal; color:var(--ink); background:var(--laugh);
        padding:0 .12em; box-decoration-break:clone; -webkit-box-decoration-break:clone; }
```

The highlighter marks the punchline phrase. Bind multi-word marks with `&nbsp;` so they wrap as a
unit. Never put red text in the h1; never highlight more than one phrase.

### 5.4 Hero sub + headfoot
Sub: one sentence per faculty max, bold the faculty words. End of sub may carry the arrival 😂
(§8.4). Headfoot row: prelim chip + mono note, `gap:18px`, `margin-top:20px`.

Prelim chip: `border:1px solid var(--red); color:var(--red)`, mono 600 0.62rem ls 0.18em
uppercase, `padding:4px 10px`, 7px red dot `::before`. Text format: `PRELIMINARY · <reason>`.
The chip is present until human calibration exists (content law §9.4).

### 5.5 Stat strip
Full-width ruled strip, `border-top:2px solid var(--ink); border-bottom:1px solid var(--line-2)`,
4 columns (2-col ≤ 820px), dividers = 1px `--line` left borders, first cell flush
left. Cell: mono label 0.6rem over mono 600 1.3rem value + `small` qualifier. 3–4 facts, each a
single number, e.g. Data refreshed / Models tracked / Bouts written / Wave-0 jokes queued.
Never cards, never boxes, never icons — a ruled strip only.

### 5.6 Tabs
`border-bottom:1px solid var(--line-2)`; buttons 700 0.88rem `--mut`, padding 11px 16px,
`margin-bottom:-1px`, transparent 2px bottom border. Active: `--ink` text + 2px `var(--laugh)`
underline. Hover: `--ink` text only. Small mono count suffix allowed. Labels are plain-English
questions (`LOL-A · Do they get the joke?`), never internal track jargon alone. A track with no
data gets no tab; it earns one pending-line instead. Wire with
`role=tablist/tab/tabpanel`, `aria-selected`, `aria-controls`, `hidden` attribute on panels.

### 5.7 Data table (the hero component)
Wrapper: 1px `--line-2` border, white bg, `overflow-x:auto`, `min-width:920px`.
Header row: `--ink` background, `#f4f2ea` mono 500 0.63rem ls 0.15em uppercase, padding 12px 14px;
sortable columns are `cursor:pointer` and carry `aria-sort`; the active sort arrow is
`var(--laugh)` (red never sorts on ink). Rows: padding 12px 14px, 1px `--line` separators, hover
`#fbfaf5`. Foot: caption strip on `--panel`, mono 0.66rem `--mut` — every table gets a caption
line explaining metric, ± meaning, and disclosures.

Columns (leaderboard): `#` · Model (name + mono lab subline + n=1 badge) · Score with ± ·
CI bar (column headed "Uncertainty") · Scored n · Spotting-bad-jokes sub-score.
Rank: mono, `--dim`; **top-3 rank chip**:
`.rkchip { background:var(--laugh); color:var(--ink); padding:1px 7px; border-radius:3px }`.
Ties break by n descending. Unscored rows: score cell says `pending` (never a dash), coverage bar
still shown. A model posts a score only once
n_scored >= 10 (spec floor, docs/02); below that it renders as a pending row. The n=1 badge
(replaces the old ANCHOR badge) discloses sample size in the visitor's own units and must be
explained in the foot caption.

No spend/cost column anywhere on the public site: what a provider currently charges (often $0
via a promotional free tier) is a business fact about the provider, not a fact about the model,
and stating it without the provider's own published pricing page as a citation misrepresents it
as a durable property. Internal cost tracking stays in `outputs/cost_log.jsonl` for the owner's
own budget guarding (docs/04) and never surfaces to visitors.

Anchor badge: `n=1` in the §3 badge style after the model name; anchor rows must be
disclosed in the foot caption ("runs once per item").

### 5.8 CI whisker bar (the signature glyph)
The error-bar whisker is the brand glyph; reuse it as decoration only via the section-divider
pattern already approved in concept docs. Data form:

```
.bar   { position:relative; height:10px; background:var(--panel); border:1px solid var(--line) }
.bar i { position:absolute; top:1px; bottom:1px; left:1px; background:var(--laugh) }  /* fill to mean */
.bar b { position:absolute; top:2px; bottom:2px; background:var(--red) }             /* CI lo→hi */
```

Markup: `<div class="bar" aria-label="95% CI {lo} to {hi}"><i style="width:{mean}%"></i><b
style="left:{lo}%;width:{hi-lo}%"></b></div>`. Yellow = the mean's magnitude; red = the
uncertainty interval drawn over it. Zero-width CI (n too small) is allowed and honest.

### 5.9 Coverage bar
`.cbar` 64×6px, 1px `--line` border, `--panel` bg. Partial fill: `--dim`. Complete fill:
`--tear`. Label right: mono 0.66rem `--mut` in `n/target` form. Status text paired with color
(color never alone): `complete` (tear) / `draining` (ink-2) / `late start` (ink-2) /
`just began` (red) / `not started` (red).

### 5.10 Boxes
1px `--line-2` border, white bg. Header row: 9px `--laugh` square + 800 title left, mono dim tag
right, `border-bottom:1px solid var(--line)`. Body padding 16px. Boxes never nest
(no cards in cards) and never carry shadows.

### 5.11 Defense rows (protocol lists)
3-column grid `1fr 16px 1fr`, hairline row separators: failure mode (`--mut`) → arrow `→`
(`--ink`) → defense (600 ink). Used for "why trust a number here" content.

### 5.12 Bout (vote booth)
2-col grid, 1px `--line-2` border, inner 1px divider, padding 20px 22px. Corner tag row: mono
0.6rem ls 0.18em uppercase dim (`PANEL A` + `CONCEALED`). Joke: Newsreader italic 1.14rem.
Controls: 3 equal cells (`A is funnier` / `B is funnier` / `Both flat`), 700 0.84rem, borders
between; hover = `--ink` bg + white text; pressed = `--laugh` bg + ink text; kbd hints in mono
0.56rem bordered chips. Keyboard `A`/`B`/`T` wired globally, ignored when focus is in a
button/input. Identity disclosure only after the ballot, in the reveal.

### 5.13 Reveal
`aria-live="polite"`, hidden until `.on`, `--panel` bg, 1px `--line-2` border (no top border),
mono 0.72rem. Format: `😂 <outcome>. Panel A was <b>model</b> · Panel B was <b>model</b>, both
W–L–T. <human line>. Identities re-conceal for the next voter.` Bold names in `--laugh-deep`.

### 5.14 Pending line
Dashed 1px `--line-2` border, padding 16px 18px, 0.9rem `--mut` with 600 `--ink-2` lead-in.
The only dashed element in the system; reserved for "not yet" states.

### 5.15 Footer
`border-top:2px solid var(--ink)`, mono 0.64rem `--dim`, three cells: domain + trust line ·
repo link · refresh stamp ending in `live partial data, not final rankings`.

---

## 6. Motion

One motion budget per page: the load reveal. `.rv` elements: `opacity:0 → 1`,
`translateY(8px) → 0`, 0.6s `cubic-bezier(.2,.7,.2,1)`, staggered 0.06s per sibling, wrapped in
`@media (prefers-reduced-motion: no-preference)` (reduced-motion users get zero animation).
Hover/active transitions: `background,color .12s`. Marquees, blink loops, scanlines, parallax,
autoplay anything: forbidden. Animated numbers only if they honor reduced-motion.

---

## 7. Interaction & accessibility

- `:focus-visible { outline:2px solid var(--red); outline-offset:2px }` everywhere; never remove.
- Keyboard: every flow operable; vote keyboard A/B/T with input guard; sort via clickable
  `th` with `aria-sort`; tabs with ARIA pattern in §5.6.
- Hit targets ≥ 44px height on controls (`.ctl` at 14px padding meets this; keep it).
- Interactive contrast increases on hover (ink fill), increases again on press (yellow).
- Status never by color alone: every colored state carries its word (§5.9 vocabulary).
- Live regions: vote reveal is `aria-live="polite"`; any async update joins it.
- Tables carry `aria-describedby` captions; CI bars and scatters carry `aria-label`/`<title>`.
- No zoom disabling, no paste blocking, `theme-color` matches `--bg`.

---

## 8. Voice & content

1. **Deadpan.** Short declaratives. The joke is the fact, stated flatly. Approved register:
   "the anchors bought their spots honestly", "First ballot takes rank 1", "claims ship when
   earned; visibility ships now", "The judge is you." No exclamation marks. No self-praise.
2. **No em dashes. Ever.** Use colon, comma, parentheses, or the middot `·`. En dashes only in
   sports notation (`W–L–T`) and numeric ranges. Curly quotes “ ” in display copy; ellipsis char
   `…`; no straight quotes in UI strings (corpus jokes keep original punctuation, minus em dashes).
3. **Numbers**: tabular always; means `0.0` precision; uncertainty as `±x.x`; coverage as
   `n/target`; money `$X.XX`; percents one decimal. A number never appears without unit or ± context.
4. **Emoji policy**: exactly one character, 😂, in exactly three places: (a) end of hero sub,
   (b) vote-reveal prefix, (c) favicon (`data:image/svg+xml` text glyph). Two on-page instances.
   No other emoji anywhere, ever, including titles, buttons, and footers.
5. **Status vocabulary** (closed set): `complete · draining · late start · just began ·
   not started · queued · pending`. Reusing words for new meanings is a bug.
6. **Disclosure defaults**: anchor tier badge + foot-caption disclosure; harness + dataset stamp
   in topbar; refresh stamp in footer; preliminary chip visible until human calibration.
7. **Attribution**: jokes are quoted with premise id + format in mono meta lines; origin story
   stays verbatim.

---

## 9. Data display laws

1. Score without ± → illegal. Uncertainty color = red, always and only.
2. Yellow = performance/human moment; blue = complete/free; red = uncertainty/warning;
   ink = everything serious. Cross-mapping (e.g. blue error bars) is illegal.
3. Rankings disclose ties (n tiebreak stated in caption) and partial rows inline, sorted into
   place with `pending`, never hidden, never filtered by default.
4. `PRELIMINARY` chip until human calibration exists; no Elo claims before vote volume
   justifies Bradley–Terry; judges are family-disjoint or the number doesn't publish.
5. No spend/cost figure ever appears on the public site (see §5.7 note): a provider's current
   price is a business fact, not a model fact, and stating it without citing the provider's own
   published pricing misrepresents a promotional rate as a durable property.
6. Scatter grammar: axes are metrics the model actually controls (score, n, family breakdown),
   never a provider-billing axis; mono labels adjacent, gridlines hairline `--line`.

---

## 10. Extension mechanisms

**New screen recipe (in order):** copy token block → topbar (same nav, current page ink
underline) → kicker → h1 with ≤ 1 highlighter phrase → sub → prelim chip if uncalibrated →
statstrip (3–4 facts) → tabs if multi-view → content per §5 → footer with refresh stamp. Check
§11 forbidden list before opening a PR.

**New component checklist:** every state present (default/hover/active/focus/disabled +
pending/empty/error data states); borders not shadows; mono for all numbers; closed-set status
word; aria per §7; no new colors; no gradients; entry added to §5 with exact px.

**New color:** only via the anatomy rule in §2; add token row + law in §9 + contrast check in
one PR. Ceiling: four accents.

**Data contracts:** `site/results.json` → table (mean, ci95 [Wilson-floored at small n],
n_scored, items, families incl. the failed-humor sub-score),
topbar stamp fields, `judge_validity`
(agreement, kappa, n_pairs; rendered in the stat strip and the Judge validity box), `counts`.
(`spend` stays internal — see §9.5 — and is never part of the public data contract.)
`site/matchups.json` → bout panels + coverage; `/api/leaderboard` → standings when votes land
(render `pending` until then). Scoring lags judging by design — render both (coverage vs scored n)
rather than hiding either.

**Breakpoints:** 940 / 900 / 820 / 760 only. **Spacing:** reuse component paddings verbatim;
new space must be even and ≤ 56px, matching the §4 rhythm.

---

## 11. Forbidden list (auto-reject in review)

1. Gradients, any kind, any direction (flat fills only).
2. Em dashes (§8.2).
3. Color zones: dark/tinted bands, headers, or sidebars; anything but white page canvas.
4. `box-shadow` (any blur), glassmorphism, glow, neon, scanlines, noise textures, confetti.
5. Fonts outside §3; the slop set (Inter/Roboto/Arial/system-ui/Space Grotesk) anywhere.
6. A second emoji character; 😂 outside §8.4's three slots.
7. Cards in cards; floating cards; equal-weight stat card rows (use the ruled strip).
8. Letter-spaced kickers more than one per page; generic chip rows of metadata.
9. Numbers without tabular-nums; means without ±; hidden partial rows; dashes as data.
10. Elo claims before volume; funniness judged by a model; any spend/cost figure on the public site.
11. Purple/blue gradient aesthetics in any form (they are the slop tell).
12. Pill buttons, radius > 4px, drop caps outside approved concepts, ticker marquees.
13. Color-only status (always pair with the §8.5 word); color-only links (underline or bold too).

---

## 12. Canonical tokens (copy-paste)

```css
:root{
  /* canvas + neutrals */
  --bg:#ffffff; --panel:#f6f5f0; --ink:#17150f; --ink-2:#403c30;
  --mut:#6f6a59; --dim:#a09a87; --line:#e7e4da; --line-2:#d6d2c4;
  /* laugh-cry accents */
  --laugh:#ffc53d; --laugh-deep:#8a6a00;   /* face: performance, human moments */
  --tear:#2f83bd;                           /* droplet: complete, free */
  --red:#b3261e; --red-bright:#e0432f;      /* uncertainty, warnings only */
  /* stacks */
  --sans:'Libre Franklin',sans-serif;
  --mono:'Spline Sans Mono',ui-monospace,monospace;
  --joke:'Newsreader',Georgia,serif;
}
```

Reference implementation: [`mockups/e-instrument.html`](../mockups/e-instrument.html) — when this
doc and the file disagree, fix both in the same PR; the file renders, the doc governs.

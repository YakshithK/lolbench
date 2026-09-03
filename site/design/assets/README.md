# assets/

`mark.svg` is the LOL Bench mark: a confidence interval whose ends turn up into a
smile. The caps are the interval, the curve is the mouth. It is drawn in
`components/chrome/Mark.jsx` and shipped here for favicons, avatars and anywhere
a static file is needed.

Colour variants: lime `#d4ff4f` on the canvas (primary), `#07080a` on a lime
square (avatars, stickers), `#eceae5` when only one ink is available. Clear space
is one cap height on all sides; minimum width 20px, below which the wordmark runs
alone.

The upstream repo contained no logo file. This mark was designed for the project
in this design system, not recovered from anywhere. No icon font, sprite or PNG
icon set exists: every glyph in the system is a chart element doing double duty,
documented in the ICONOGRAPHY section of the root `readme.md`.

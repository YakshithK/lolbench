repo: YakshithK/lolbench
branch: master
path:

## Last sync
date: 2026-09-02T21:10:00Z
tree: 2eea442547fd

### Updated in this project
- Rewrote the system as a dark, chart-first console at the owner's direction; the v1 white/serif spec was replaced, its honesty rules kept.
- Designed the LOL Bench mark: an error bar with its ends turned up. The repo had no logo file.
- Plotted the F1-F6 mechanism data from `results.json` for the first time: every model collapses on F6.
- Rebuilt the token layer, 27 components, 13 foundation cards, two templates and the UI kit on the new direction.

## Screen map
| Project screen / file | Built from |
|---|---|
| `tokens/*.css` | New: the console direction. Rules inherited from `docs/07-design-system.md` §8-§9 |
| `components/chrome/*` | New mark and lockup; topbar/footer structure from `site/index.html` |
| `components/head/*` | New: hero language rewritten from `docs/01-vision.md` in plain words |
| `components/data/Scatter.jsx` | `mockups/e-instrument.html` scatter, redrawn with vertical ranges |
| `components/data/Heatmap.jsx` | `site/results.json` `lol_a[*].families` (F1-F6) |
| `components/data/DotMatrix.jsx` | `site/results.json` `n_scored` per model |
| `components/data/BarList.jsx` | `mockups/e-instrument.html` BOUTS map |
| `components/data/Standings.jsx`, `ScoreCell.jsx` | `site/results.json` means and `ci95` |
| `components/vote/*` | `site/index.html` vote loop; bout texts from `mockups/e-instrument.html` |
| `templates/leaderboard/Leaderboard.dc.html` | Composite of the above |
| `templates/brand-kit/BrandKit.dc.html` | New: logo, type and colour spec |
| `ui_kits/lolbench_site/*` | `site/index.html`, `site/results.json`, `mockups/e-instrument.html` |
| `assets/mark.svg` | New: designed here, replaces the 😂 favicon data URI |

## Sync history
- 2026-09-02T19:34Z — first import: built the v1 white/serif system directly from `docs/07-design-system.md`. Superseded by the rewrite above.

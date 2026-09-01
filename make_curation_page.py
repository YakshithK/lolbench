import json
import html

items = [json.loads(l) for l in open("data/lol_a_items.jsonl", encoding="utf-8-sig") if l.strip()]
premises = [json.loads(l) for l in open("data/lol_b_wave0_premises.jsonl", encoding="utf-8-sig") if l.strip()]

out = ["<!DOCTYPE html><html><head><meta charset=utf-8><title>LOL Bench curation</title>",
       "<style>body{background:#0d0f16;color:#eee;font-family:monospace;max-width:900px;margin:40px auto;padding:0 20px}"
       "h2{color:#ffd166;margin-top:40px}h3{color:#8b93a7}pre{background:#161a26;padding:14px;border-radius:8px;"
       "white-space:pre-wrap;border-left:3px solid #ffd166}.g{color:#5dd39e}.stat{color:#8b93a7}</style></head><body>",
       "<h1>LOL Bench curation pass</h1>",
       "<p class=stat>Read, fix, delete. Edit data/lol_a_items.jsonl directly when you find problems. "
       "Scores stay PRELIMINARY until this pass is done.</p>"]

fams = {}
for it in items:
    fams.setdefault(it["family"], []).append(it)

for f in sorted(fams):
    out.append(f"<h2>{f} ({len(fams[f])} items)</h2>")
    for it in fams[f]:
        out.append(f"<h3>{it['id']} <span class=stat>edginess {it['edginess_budget']}</span></h3>")
        out.append("<pre>" + html.escape(it["text"]) + "</pre>")
        out.append(f"<p class=stat>Q: {html.escape(it['question'])}</p>")
        out.append("<p class=g>GOLD: " + html.escape(" | ".join(it["gold_elements"])) + "</p>")

out.append("<h2>LOL-B premises (40)</h2>")
for p in premises:
    out.append(f"<p>{p['id']} <span class=g>[{p['edginess_budget']}]</span> {html.escape(p['premise'])}</p>")

out.append("</body></html>")
open("curation.html", "w", encoding="utf-8").write("\n".join(out))
print(f"curation.html written: {len(items)} items, {len(premises)} premises")

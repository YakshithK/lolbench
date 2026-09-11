"""Freshness check: flag sourced items whose humor depends on the news cycle.

A joke that references a dated event as current ("Superbowl 2020 hasn't announced
teams yet") reads BROKEN to a 2026 voter, and that staleness vote gets recorded
as an unfunny vote. This filter flags candidates; quarantining is a human call
(see report output). Read-only: never modifies pools.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

YEAR = re.compile(r'\b(19\d{2}|20[0-3]\d)\b')
FUTURE_TALK = re.compile(
    r'\b(upcoming|announced|will be playing|hasn\'t (yet )?been|not yet |'
    r'recently|just announced|this year|next (week|month|year)|'
    r'upcoming election|campaign|nominee)\b',
    re.IGNORECASE)
EVENT = re.compile(
    r'\b(super ?bowl|world cup|olympics?|election|inauguration|president \w+|'
    r'prime minister|covid|pandemic|lockdown|brexit|world series|playoffs?|'
    r'finals|championship|grammy|oscar)\b',
    re.IGNORECASE)


def flags_for(text):
    flags = []
    years = YEAR.findall(text or '')
    if years:
        flags.append('year:' + ','.join(sorted(set(years))))
    m = FUTURE_TALK.search(text or '')
    if m:
        flags.append('future-talk:' + m.group(0))
    m = EVENT.search(text or '')
    if m:
        flags.append('event:' + m.group(0))
    return flags


def scan_pool(path, text_keys):
    try:
        raw = Path(path).read_text(encoding='utf-8-sig')
    except FileNotFoundError:
        print(f'{path}: MISSING FILE')
        return
    rows = []
    for l in raw.splitlines():
        if l.strip():
            try:
                rows.append(json.loads(l))
            except Exception:
                pass
    if not rows:
        try:
            data = json.loads(raw)  # plain JSON array file (e.g. site/c_probes.json)
            rows = data if isinstance(data, list) else [data]
        except Exception:
            pass
    hits = 0
    for i, r in enumerate(rows):
        text = ' '.join(str(r.get(k) or '') for k in text_keys)
        fl = flags_for(text)
        if fl:
            hits += 1
            rid = r.get('id') or r.get('item_id') or r.get('pair_id') or f'row-{i}'
            print(f'  FLAG {rid}: {fl}')
            print(f'    {(text[:160] + "...") if len(text) > 160 else text}')
    print(f'{path}: {hits}/{len(rows)} flagged')


if __name__ == '__main__':
    scan_pool(ROOT / 'data/lol_c_pools.jsonl', ['joke_a', 'joke_b', 'text_a', 'text_b', 'text'])
    scan_pool(ROOT / 'site/c_probes.json', ['joke_a', 'joke_b', 'text_a', 'text_b', 'text'])
    scan_pool(ROOT / 'data/lol_a_items.jsonl', ['text', 'joke', 'setup', 'content'])
    scan_pool(ROOT / 'data/lol_a_f1f5_candidates_draft.jsonl', ['text', 'joke', 'setup', 'content'])

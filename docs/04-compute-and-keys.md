# LOL Bench — Compute, Calls, and Keys

## Free-tier reality (verified 2026-09-20; fourth death wave - every lane)

The 2026-09-17 HC "stacking" was not a throttle. It was the free credit pool
draining. On 2026-09-20 every provider residues to zero, verified by direct probe:

- Hack Club: proxy is OpenRouter-backed. All slugs now return HTTP 402
  `Insufficient credits` (limit_source `openrouter_credits`); a live slug
  (gemini-3.1-pro) returns 400 `not a valid model ID`. Per-slug routing is gone,
  it is one account credit pool. The ~600-row 09-17 burst was the last spend.
- b.ai: three keys, all `balance=0` / `insufficient_user_quota` (09-17, escalated).
- kiraai.vn: free slugs 404 `model_not_found`; bare slugs 402 empty VND wallet.
- OpenRouter: key `API key expired` (401) - both /credits and /key.
- xAI direct: 403 `team ... used all available credits or reached monthly limit`.
- tokenrouter (an OR reseller): 200 on /models, but every chat 403
  `insufficient_user_quota`; gift balance 0. The one `:free`-tagged model is also
  0. Dead lane, not a workaround.
- explabs: /models returns 288 models and 200, but every chat is
  `model_requires_purchase ... locked until you make a purchase`. Listing, not
  access.
- Gemini/Groq/Cerebras free tiers: unchanged policy, not held by us; Gemini
  ~250 req/day cannot carry the run.

Net: there is no funded free lane left. Any further work needs either owner
credits on one paid lane (OpenRouter is cheapest at ~$0.0005/row and the wallet
402 is the safety that worked), or the local hardware lane (RTX 5060 8GB / Mac
Studio M4 Ultra 64GB) reusing `harness/*.py` against a local OpenAI-compatible server.

## Call budget (the honest math)

It is not "how many times do we run it" — it is calls per model per event.

| Event | Formula | Day-1 number |
|---|---|---|
| LOL-A run | items x samples x models | 200 x 5 x ~5 = ~5,000 candidate calls |
| LOL-A judging | same count, judge model | ~5,000 judge calls |
| LOL-B wave-0 | premises x models | 40 x ~5 = ~200 calls (trivial) |
| LOL-C | zero generation (correlation math on existing pools) | 0 |

- Full day-1 total: ~10,000 short calls (~1k tokens each) ≈ 10M tokens ≈ single-digit dollars on paid APIs. **Rate limits are the constraint, never money.**
- Re-runs are event-triggered only: new model added, item set expanded (C5 doubles: n 5→10), new wave, quarterly audit.

## Free-tier reality (verified 2026-09-17; third death wave)

- b.ai: DEAD on all three keys (balance=0, `insufficient_user_quota`, verified
  per-key 2026-09-17) - the third free-tier death after deepseek (deal ended)
  and glm-5.3-flash (quota 0, 2026-09-12). Both live judges (qwen + hy) were
  bai lanes: rerouted same-day to Hack Club (`qwen/qwen3.8-flash`,
  `tencent/hy3`, both verified 200; families unchanged so exclusions hold).
- kiraai.vn: free tier restructured to paid between 2026-09-13 and 2026-09-17.
  All four `-free` slugs 404 (`model_not_found`); bare slugs 402 on an empty
  VND wallet. kira-glm-judge (216s/call backup) is unrunnable until funded.
  Lesson: a spare lane only counts while its billing model is verified live;
  re-probe before depending on it.
- Hack Club: free, no payment rail, throttling per-slug AND account-level.
  2026-09-17 burst delivered ~600 generation rows (gemini completed 419,
  claude 48 -> 416, muse 31 -> 184) then stacked account-wide; judges at
  6 concurrent stacked it further (13 verdicts then all-429). Dropped to
  4 concurrent + cool-down between phases. Skip-and-rotate now applies to
  whole phases, not just slugs: generation and judging take turns on one
  account.
- (2026-09-12 notes, kept for history)
- b.ai (2026-09-12): three keys rotated; glm-5.3-flash free quota went to 0 on ALL keys
  (balance=0) on 2026-09-12 - glm-judge retired, qwen+hy judges hold the 2-judge
  floor for every pending model. deepseek free deal ended earlier (2026-09).
- Hack Club: free, no payment rail, but throttling is per-slug AND account-level.
  Burst windows after a reset let bulk through, then shutters close per slug
  (muse 6/371, gpt 251/371, gemini 0/371 while others flowed). Grind-retries can
  claw through (qwen 200 -> 819) at poor retry economics; skip-and-rotate wins.
  20 RPM configured; the real ceiling is lower and varies.
- OpenRouter (paid): used as a burst lane 2026-09-12 - $0.42 metered finished
  mimo-pro (855 rows) and grok bulk (345). Measured ~$0.0005/row at our token
  shapes (350 in / 80 out), 2x the naive estimate. Prepaid wallet = hard 402 stop,
  which is the safety that worked. Slugs: `qwen/qwen3.8-max-0902` is the dated
  snapshot of qwen3.8-max (undated slug not listed on OR).
- xAI direct: grok-4.6 on owner credits (371-row anchor set ~$0.17); native slug
  `grok-4.6` verified on api.x.ai. Routing reverts to Hack Club when wallet is dry.
- Gemini free tier: ~10 RPM / ~250 requests/day — cannot carry the run; capped slot only.
- Groq: ~30 RPM / ~14k requests/day (Llama family) — bulk workhorse.
- Cerebras: free, fast — secondary open-model slot.
- OpenAI/Anthropic: no free tiers; owner keys only, frontier slots.
- Re-read provider ToS quarterly (free tiers: assume rate limits + data-use disclosure; disclose on-site if the provider trains on free-tier traffic).

## Provider doctrine (learned the hard way, week one)
- One dead provider never stops the whole run: candidates, judges, and generation
  each keep >=2 live providers. The 2026-09-12 glm-judge retirement proved the design
  - zero data lost, floor held, board published same day.
- Free tiers are for burst windows; paid prepaid wallets are for finishing moves;
  throttles are for waiting out. Know which mode you're in before launching.
- Never leave a runner grinding a 429-only slug: it starves queued models. Kill,
  skip, rotate, circle back (muse/gpt/gemini pattern, 2026-09-12).
- Single probes lie: a 200 OK on one call proves routing, not capacity
  (2026-09-17: muse + grok slugs probed clean, then went 0-ok under sustained
  calling). The only valid window test is a sustained mini-run (~20 calls);
  probe-then-launch on one data point burns the cool-down it was measuring.

## Hardware roles (owner has: RTX 5060 8GB, Mac Studio M4 Ultra 64GB)
| Machine | Role | Reality check |
|---|---|---|
| Mac Studio 64GB unified | 70B-class candidates at 4-bit quant (~40GB weights) + PRIVATE JUDGE — zero API cost, zero rate limits | Verify tok/s empirically day 1; assume 10–20 tok/s class conservatively; overnight batch is fine |
| RTX 5060 8GB | 7–8B dev/debug + smallest candidate slots | VRAM-bound; quantized small models only |
| APIs (Groq/Cerebras/Gemini free) | Additional candidate diversity | Queue-based runner absorbs rate limits |
| APIs (owner keys) | Frontier candidates ONLY (GPT/Claude/Gemini as scored models) | Judge never needs to be API — local Studio judge removes the biggest cost and the self-judging risk |

## Runner design
- Queue-based, rate-limit aware, checkpointed (a killed run resumes, never restarts).
- Sequential where free tiers demand it; the overnight queue is a feature, not a blocker.
- Every call logged: model, prompt hash, sample index, tokens, latency, result → reproducibility file.

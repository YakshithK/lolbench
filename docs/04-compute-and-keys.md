# LOL Bench — Compute, Calls, and Keys

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

## Free-tier reality (verified)
- Gemini free tier: ~10 RPM / ~250 requests/day — cannot carry the run; used as a capped candidate slot only.
- Groq: ~30 RPM / ~14k requests/day (Llama family) — bulk workhorse.
- Cerebras: free, fast — secondary open-model slot.
- OpenAI/Anthropic: no free tiers; owner keys optional, only needed for frontier candidates.
- Re-read provider ToS at C2 (free tiers: assume rate limits + data-use disclosure; disclose on-site if the provider trains on free-tier traffic).

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

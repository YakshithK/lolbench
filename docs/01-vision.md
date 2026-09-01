# LOL Bench — Vision

## Origin
Someone building an open-code platform posted they were "looking to fund someone making LLMs funny." Another quote-tweeted: "Who's building LOL bench?" The reply: "Give me a few hours." The response: "Get this guy a job stat."

The name is the callback. LOL Bench — because the internet asked for it by name, and because lolbench.lol is the only TLD where the domain itself is a joke. It became more than the joke once the research held up.

## Why now (verified ecosystem facts)
- No humor benchmark appears in any major model card (GPT, Llama, Gemini report MMLU/GSM8K-class evals, never humor).
- The category's all-time citation ceiling is ~130 (SemEval-2017 Task 7, 9 years); MT-Bench has ~10,800 in 3 years. Humor eval is a niche with a vacancy, not a crowded field.
- 2025–26 wave is active but tiny and young: HumorBench (Jul 2025, 8 citations, live human-voted Elo leaderboard), Oogiri 6-dimension study (Nov 2025), HumorRank + SemEval-2026 Task 1 MWAHAHA (28 teams, first-ever SemEval humor shared task).
- The historical failure mode is not topic disinterest — it is **judge mistrust**. LLM judges weight Novelty where humans weight Empathy (Oogiri finding); single LLM judges misjudge jokes ("Is GPT-4 Good Enough to Evaluate Jokes?", 2023); human inter-annotator agreement on funniness caps around Krippendorff alpha ≈ 0.45 (HumorRank).

## Thesis
Humor is three separable faculties, and each supports a different evaluation method:
1. **Comprehension** is convergent — agreement is high, rubric scoring works (HumorBench showed STEM reasoning transfers to it).
2. **Production** is divergent — humans barely agree with each other, so pairwise preference + tournament aggregation is the only honest scoring (Chatbot Arena's 2M-vote precedent; HumorRank's Swiss + Bradley-Terry).
3. **Discrimination (taste)** is correlational — cheap, automatable, and uncovered by any existing benchmark.

A model can ace one and fail the others. Measuring the dissociation IS the scientific product.

## Positioning: credibility-first
- Every prior attempt that overclaimed judge validity died on adoption.
- LOL Bench publishes its own error bars (human alpha, judge-validity score, CIs) on the leaderboard page itself, not in an appendix.
- The PRELIMINARY banner is the moat: we ship visibility immediately and claims only when earned.

## Success definition (no external fruit is the goal)
Success = a self-sustaining, honest measurement instrument: two consecutive clean waves with published alpha, judge validity, and CIs. Anything downstream (adoption, press, community) is a byproduct, not a target.

## What LOL Bench is NOT (v1 scope)
- Not multilingual (English first; MWAHAHA covers ES/ZH)
- Not multimodal (image/GIF humor is a known follow-on; MWAHAHA subtask B precedent)
- Not a humor-theory compliance test (GTVH informs design, not scoring)

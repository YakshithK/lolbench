You are a strict but fair humor-comprehension grader for LOL Bench (lolbench.lol),
evaluating an item where the model was asked whether a piece of text lands as a
joke or fails, and to defend its own verdict.

You will be given:
1. The text the model evaluated.
2. The model's stated verdict and explanation.
3. Reference notes describing why this text reads as a flat, engineered non-joke.
   These are context for you, not the only acceptable answer.

Your job is NOT to check whether the model's verdict matches the reference notes.
A model may argue the opposite verdict (for example, that the text works as a
deliberate anti-joke or deadpan bit) and still be correct, if the argument is
specific and grounded in the actual text.

Score the argument, not the verdict, on a 0-100 scale:
- 90-100: a clear verdict, defended with a SPECIFIC, textually-grounded mechanism.
  Arguing "fails" must show there is no real comic device present (matching or
  improving on the reference notes' reasoning). Arguing "works" (e.g. anti-humor,
  deadpan) must name the SPECIFIC expectation being deliberately subverted and why
  the flat delivery itself is the device - not just assert "this is intentional"
  without grounding it in actual words from the text.
- 60-89: a verdict with a named mechanism that is mostly grounded but slightly
  generic, hedged, or missing one piece of specificity.
- 20-59: a verdict is stated but the mechanism is vague, generic, or only
  loosely connected to the actual text.
- 0-19: no real verdict, no mechanism identified, the explanation contradicts
  itself, or it invents a mechanism that is not actually present in the text.
- Do not penalize a model for disagreeing with the reference notes' verdict.
  Penalize only ungrounded, generic, or self-contradictory reasoning.
- Do not reward verbosity, hedging, or flattery. Judge content only.

Text evaluated:
{{text}}

Question:
{{question}}

Reference notes (why this reads as a flat non-joke - context, not the only
acceptable answer):
{{gold_elements}}

Output STRICT JSON, no markdown, no commentary:
{"score": <integer 0-100>, "reason": "<one sentence>"}

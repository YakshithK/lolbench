"""
Content-safety classification for sourced joke pools - a distinct, legitimate
use of an LLM from the benchmark's actual judging: this asks "is this
appropriate for a public general-audience site," never "is this funny" or
"how difficult is this." That distinction matters: using an LLM's opinion as
the benchmark's ground truth for humor would reintroduce the exact
judge-grades-itself circularity this project has spent a long time fixing;
using one to flag explicit/offensive content before a human ever sees it is
ordinary content moderation, no different in kind from a spam filter.

Two heterogeneous models must BOTH agree a joke is appropriate for it to pass -
an AND-gate, not majority vote, so a single model's blind spot doesn't let
something through. Mirrors the project's existing dual-judge pattern for the
same reason: no single model's judgment is trusted alone.

Classifier roster history (same retirement pattern as the judge roster):
- (explabs, qwen3.8-27b + gpt-5.6-luna): the sourcing-time gate for v0.3.
  Retired 2026-09-12 - luna went hard 401 (dead credential, not throttling)
  and 27b sat in a 429 storm; fail-closed behavior means a dead classifier
  silently drops the whole pool.
- (bai, qwen3.8-flash + hy3): same day, brief tenure - single calls were
  healthy but the account carried a stacked throttle from the day's earlier
  judge traffic and errored through most of a paced run (measured: 8 of the
  first 12 classifications errored at ~12rpm). Left pending by the tri-state
  classifier, not dropped.
- (hackclub, qwen/qwen3.8-max + deepseek/deepseek-v4-pro): current pair.
  Family-disjoint (qwen/deepseek), answered clean JSON on first try, and HC's
  20rpm config is comfortably above the paced classification load.
"""
import json
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from run import ROOT, chat, load_env  # noqa: E402

MODELS = [("hackclub", "qwen/qwen3.8-max"), ("hackclub", "deepseek/deepseek-v4-pro")]

PROMPT = """You are a content-safety classifier for a public benchmark website that must be safe for children and families - roughly a PG / Disney-movie standard.

Decide whether the following joke meets that bar. Reject:
- sexual content or sexual innuendo of any kind, including anything that sexualizes bodies (breasts, genitals, pregnancy framed sexually) or crude shock-humor about sexual topics or bodily functions
- slurs or content demeaning a protected group (race, religion, gender, sexuality, disability) - this includes mocking sacred figures, crucifixion, or religious practices themselves, not just slurs against believers
- glorification of violence or crime
- graphic gore

Dark, absurd, or edgy humor is fine as long as it avoids all of the above. Jokes where believers are the butt of gentle everyday humor (church-goer stereotypes, "my grandma prays too loud") are acceptable; mockery of the faith's sacred figures or rituals is not. If you are unsure, reject.

Joke:
\"\"\"{text}\"\"\"

Respond with ONLY a JSON object: {{"appropriate": true or false, "reason": "one short sentence"}}"""

print_lock = threading.Lock()


def classify_one(provider, model, text):
    messages = [{"role": "user", "content": PROMPT.format(text=text)}]
    for attempt in range(4):
        try:
            raw = chat(provider, model, None, messages, 0.0, 300)
            m = re.search(r"\{.*\}", raw, re.S)
            if m:
                o = json.loads(m.group(0))
                if "appropriate" in o:
                    return bool(o["appropriate"])
        except Exception as e:
            with print_lock:
                print(f"[warn] {model} classify attempt {attempt}: {e}", flush=True)
            time.sleep(2 * (attempt + 1))
    return None  # unparseable after retries - treated as NOT appropriate (fail closed)


def is_appropriate(text, workers_note=None):
    """Both configured models must independently agree it's appropriate."""
    results = []
    for provider, model in MODELS:
        r = classify_one(provider, model, text)
        results.append(r)
    return all(r is True for r in results)


def classify_status(text):
    """Tri-state classification for sourcing passes that must distinguish
    'this joke was judged inappropriate' from 'the infrastructure hiccuped'.

    Returns (status, model_or_note):
      - ('passed', '')            both models say appropriate
      - ('rejected', model)       at least one model says NOT appropriate (AND-gate)
      - ('provider_filtered', m)  the provider's own WAF refused the request
                                  body (HTTP 400) - an infra-level content
                                  rejection, not a model verdict. Response
                                  body is logged so the label is grounded
                                  (the read-the-error-body rule).
      - ('error', m)              429/401/5xx/parse failures - may succeed on
                                  a later pass; caller should leave PENDING,
                                  never silently drop (fail-closed during an
                                  outage would drain the pool invisibly).
    """
    verdicts = []
    for provider, model in MODELS:
        messages = [{"role": "user", "content": PROMPT.format(text=text)}]
        got = None
        for attempt in range(4):
            try:
                raw = chat(provider, model, None, messages, 0.0, 300)
                m = re.search(r"\{.*\}", raw, re.S)
                if m:
                    o = json.loads(m.group(0))
                    if "appropriate" in o:
                        got = bool(o["appropriate"])
                        break
            except Exception as e:
                body = ""
                try:
                    body = e.read().decode("utf-8", errors="replace")[:220]  # HTTPError
                except Exception:
                    body = str(e)
                with print_lock:
                    print(f"[warn] {model} classify attempt {attempt}: {body}", flush=True)
                if "400" in str(e):
                    return "provider_filtered", f"{model}: {body}"
                time.sleep(2 * (attempt + 1))
        if got is None:
            return "error", model
        verdicts.append(got)
    if all(v is True for v in verdicts):
        return "passed", ""
    return "rejected", verdicts[0] if verdicts else ""


def filter_pool(texts, max_workers=6, label=""):
    """texts: list of unique strings. Returns the set of texts that passed
    both classifiers. Runs classification for both models per text in
    sequence. max_workers=6: throttle() paces per (provider, key-slot) window
    (see run.py), so 6 workers stay comfortably under the 60rpm cap even
    before key rotation spreads load. History: 8 workers x 2 sequential
    calls each badly overran the old shared 60rpm window, causing a 429
    produced only 75/400 classifications, an 8+ hour real ETA. Confirmed by
    killing that run and re-measuring at this concurrency before trusting it."""
    passed = set()
    done = 0
    lock = threading.Lock()

    def worker(text):
        nonlocal done
        ok = is_appropriate(text)
        with lock:
            done += 1
            if done % 25 == 0:
                print(f"[safety:{label}] {done}/{len(texts)} classified", flush=True)
        if ok:
            passed.add(text)

    with ThreadPoolExecutor(max_workers=max_workers) as ex:
        list(ex.map(worker, texts))
    print(f"[safety:{label}] {len(passed)}/{len(texts)} passed both classifiers", flush=True)
    return passed


if __name__ == "__main__":
    load_env()
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true", help="run a handful of known-bad and known-good examples to sanity check the classifier itself")
    args = p.parse_args()
    if args.test:
        cases = [
            ("Why did the chicken cross the road? To get to the other side.", True),
            ("What do you call a fish with no eyes? A fsh.", True),
            ("I told my wife she was drawing her eyebrows too high. She looked surprised.", True),
            ("My grandma prays so loud the neighbors think the house is on fire.", True),
            ("Why did a black bear fuck a white boy to death? The casting agent took the porn's title literally.", False),
            ("A rapist and con artist gets caught by the sheriff in a small town. But he gets released because sitting presidents can't be indicted.", False),
            ("I asked a pregnant woman what cup size she was. She said 500ml.", False),
            ("[religion]What's the difference between Jezus and a picture of Jezus? You only need one nail to hang the picture", False),
        ]
        for text, expected in cases:
            result = is_appropriate(text)
            status = "OK" if result == expected else "MISMATCH"
            print(f"[{status}] expected={expected} got={result}: {text[:80]}")

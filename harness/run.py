import argparse
import json
import os
import threading
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CFG = yaml.safe_load((ROOT / "harness" / "config.yaml").read_text(encoding="utf-8"))

PROVIDER_URLS = {
    "groq": "https://api.groq.com/openai/v1/chat/completions",
    "gemini": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    "bai": "https://api.b.ai/v1/chat/completions",
    "tokenrouter": "https://api.tokenrouter.com/v1/chat/completions",
    "openrouter": "https://openrouter.ai/api/v1/chat/completions",
    "xai": "https://api.x.ai/v1/chat/completions",
    "hackclub": "https://ai.hackclub.com/proxy/v1/chat/completions",
    "explabs": "https://api.experientiallabs.ai/v1/chat/completions",
}

ENV_KEYS = {
    "groq": "GROQ_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "bai": "BAI_API_KEY",
    "tokenrouter": "TOKENROUTER_API_KEY",
    "openrouter": "OPENROUTER_API_KEY",
    "xai": "XAI_API_KEY",
    "hackclub": "HACKCLUB_API_KEY",
    "explabs": "EXPLABS_API_KEY",
}

WINDOWS = {}
WINDOWS_LOCK = threading.Lock()
PRINT_LOCK = threading.Lock()
KEY_ROUND_ROBIN = {}
KEY_RR_LOCK = threading.Lock()


SPEND = {"usd": 0.0}
SPEND_LOCK = threading.Lock()


def load_env():
    env_file = ROOT / "harness" / ".env"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8-sig").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip())


# Per-model USD pricing (per 1M tokens): what the model actually costs to run,
# not what our harness happened to pay. A provider offering a model for free
# (b.ai's flash tier, Hack Club's proxy) is a promotional deal about the
# provider, not a fact about the model's real inference cost — it never
# reads as $0 here. Flash/base-tier prices are ESTIMATES (~1/10 of the
# sibling pro/max price, the typical real-world flash:pro ratio) since no
# billed rate exists for them; everything else is the harness's own metered
# rate. Reasoning models burn extra hidden output tokens; paid prices are
# CEILING prices.
MODEL_PRICES = {
    "glm-5.3-flash": (0.15, 0.45), "deepseek-v4-flash": (0.15, 0.30), "hy3": (0.15, 0.35),
    "mimo-v2.5": (0.10, 0.20), "qwen3.8-flash": (0.20, 0.60),
    "glm-5.3": (1.4, 4.4), "deepseek-v4-pro": (1.6, 3.2),
    "qwen3.8-max": (2, 6), "mimo-v2.5-pro": (0.44, 0.87), "hy4-preview": (0.83, 2.5),
    "gpt-5.6-sol-pro": (2, 10), "gemini-3.1-pro": (2, 12),
    "claude-opus-5": (5, 25), "muse-spark-1.2": (1.25, 4.25),  # metered OpenRouter 2026-09-12 (was estimated)
    "grok-4.6": (2, 6),
}
# Models whose flash/base price above is an estimate (no billed rate exists),
# not a metered one. Surfaced in results.json so the UI can disclose it.
ESTIMATED_PRICE_MODELS = {"glm-5.3-flash", "deepseek-v4-flash", "hy3", "mimo-v2.5", "qwen3.8-flash"}
COST_LOG = ROOT / "outputs" / "cost_log.jsonl"


def record_cost(model, usage):
    pin, pout = MODEL_PRICES.get(model, (5, 25))  # unknown models priced pessimistically
    tin = (usage or {}).get("prompt_tokens", 0)
    tout = (usage or {}).get("completion_tokens", 0)
    usd = tin / 1e6 * pin + tout / 1e6 * pout
    with SPEND_LOCK:
        SPEND["usd"] += usd
        COST_LOG.parent.mkdir(parents=True, exist_ok=True)
        with COST_LOG.open("a", encoding="utf-8") as f:
            f.write(json.dumps({"model": model, "in": tin, "out": tout, "usd": round(usd, 6), "total": round(SPEND["usd"], 4), "ts": time.time()}) + "\n")
    return usd


def spend_exceeded():
    cap = float(CFG.get("max_spend_usd", 0) or 0)
    return cap and SPEND["usd"] >= cap


def provider_keys(provider):
    """All configured API keys for a provider: the primary ENV_KEYS entry
    plus numbered variants (BAI_API_KEY, BAI_API_KEY_2, BAI_API_KEY_3, ...).
    Read live from environ on every call so .env changes via load_env()
    are picked up without restarts. Empty list = provider unauthenticated
    (same as before: requests go out without an Authorization header)."""
    base = ENV_KEYS.get(provider, "")
    keys = []
    if base:
        k0 = os.environ.get(base, "")
        if k0:
            keys.append(k0)
        i = 2
        while True:
            ki = os.environ.get(f"{base}_{i}", "")
            if not ki:
                break
            keys.append(ki)
            i += 1
    return keys


def pick_key(provider):
    """Thread-safe round-robin over a provider's keys. Returns (key, slot).
    One key per call (not per retry attempt): retries stay on the same key
    so backoff semantics are unchanged and 429 accounting stays attributable
    to the key that actually got refused. Single-key providers always get
    slot 0, byte-identical behavior to before rotation existed."""
    keys = provider_keys(provider)
    if not keys:
        return "", 0
    with KEY_RR_LOCK:
        n = KEY_ROUND_ROBIN.get(provider, 0)
        KEY_ROUND_ROBIN[provider] = n + 1
    return keys[n % len(keys)], (n % len(keys))


def throttle(provider, slot=0):
    rpm = CFG.get("rate_limits_rpm", {}).get(provider, 0)
    if not rpm:
        return
    # Windows are per (provider, key-slot), not per provider: each key gets
    # the full configured rpm in its own window. If provider limits turn out
    # to be per-account/IP rather than per-key, the 429 rate will show it
    # (watch the log) - and rotation degrades gracefully to plain round-robin
    # with no worse behavior than a single key.
    # Concurrent callers (judge.py/safety_filter.py run several worker threads)
    # were racing on this shared counter with no lock: two threads could both
    # read w["n"] < rpm before either incremented it, letting more than rpm
    # calls through per window and triggering 429 storms the retry logic then
    # made worse (each failure sleeps and retries, compounding the overrun).
    window = f"{provider}#{slot}"
    with WINDOWS_LOCK:
        w = WINDOWS.setdefault(window, {"t": time.time(), "n": 0})
        now = time.time()
        if now - w["t"] >= 60:
            w["t"], w["n"] = now, 0
        if w["n"] >= rpm:
            sleep_for = max(0.0, 60 - (now - w["t"])) + 0.5
        else:
            sleep_for = 0.0
        w["n"] += 1
    if sleep_for:
        time.sleep(sleep_for)
        with WINDOWS_LOCK:
            w["t"], w["n"] = time.time(), 0


def chat(provider, model, base_url, messages, temperature, max_tokens, retries=6, cost_key=None, extra_payload=None):
    url = base_url or PROVIDER_URLS[provider]
    key, slot = pick_key(provider)
    headers = {"Content-Type": "application/json"}
    if key:
        headers["Authorization"] = f"Bearer {key}"
    body = {"model": model, "messages": messages, "temperature": temperature, "max_tokens": max_tokens}
    if extra_payload:
        body.update(extra_payload)
    payload = json.dumps(body).encode("utf-8")
    delay = 2.0
    for attempt in range(retries):
        throttle(provider, slot)
        req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=240) as r:
                data = json.loads(r.read().decode("utf-8"))
                record_cost(cost_key or model, data.get("usage"))
                return data["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < retries - 1:
                time.sleep(delay)
                delay = min(delay * 2, 90)
                continue
            raise


def render(template_path, mapping):
    text = Path(template_path).read_text(encoding="utf-8")
    for k, v in mapping.items():
        text = text.replace("{{" + k + "}}", str(v))
    return text


def done_keys(path):
    keys = set()
    if path.exists():
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            if line.strip():
                try:
                    o = json.loads(line)
                    keys.add(f'{o["item_id"]}|{o["sample"]}')
                except Exception:
                    pass
    return keys


def append_result(path, obj, lock=None):
    path.parent.mkdir(parents=True, exist_ok=True)
    line = json.dumps(obj, ensure_ascii=False) + "\n"
    if lock:
        with lock:
            with path.open("a", encoding="utf-8") as f:
                f.write(line)
    else:
        with path.open("a", encoding="utf-8") as f:
            f.write(line)


def load_jsonl(path):
    return [json.loads(l) for l in path.read_text(encoding="utf-8-sig").splitlines() if l.strip()]


def run_candidate(cand, items, premises):
    name = cand["name"]
    base_url = cand.get("base_url")
    provider = cand["provider"]
    model = cand["model"]
    n = CFG["anchor_samples"] if cand.get("anchor") else CFG["n_samples"]
    nb = CFG.get("lol_b_samples", CFG["n_samples"])
    temp = CFG["temperature"]
    mt = CFG["max_output_tokens"]
    workers = max(1, int(CFG.get("parallel_workers", 1)))
    lock = threading.Lock()
    # think: false -> disable reasoning via OpenRouter's unified param (cost control).
    # Applies on hackclub too: it fronts the same OpenRouter routes (verified
    # live: the param is accepted), so think:false candidates keep identical
    # behavior whichever of the two pipes they run on.
    extra = {"reasoning": {"enabled": False}} if (cand.get("think") is False and provider in ("openrouter", "hackclub")) else None

    out_a = ROOT / CFG["paths"]["outputs"] / name / "lol_a.jsonl"
    done = done_keys(out_a)
    tasks = [(item, s) for item in items for s in range(n) if f'{item["id"]}|{s}' not in done]
    print(f"[a] {name}: {len(tasks)} calls to make", flush=True)
    prompt_cache = {
        item["id"]: render(
            ROOT / "harness" / "prompts" / "explain.md",
            {"text": item["text"], "question": item["question"]},
        )
        for item in items
    }

    def a_worker(task):
        item, s = task
        key = f'{item["id"]}|{s}'
        if spend_exceeded():
            with PRINT_LOCK:
                print(f"[spend-guard] skipping {name} {key}: max_spend_usd reached", flush=True)
            return
        content = None
        budget = mt
        for try_i in range(2):
            try:
                content = chat(provider, model, base_url, [{"role": "user", "content": prompt_cache[item["id"]]}], temp, budget, cost_key=name, extra_payload=extra)
            except Exception as e:
                with PRINT_LOCK:
                    print(f"[warn] {name} {key}: {e}", flush=True)
                return
            if content and content.strip():
                break
            budget = budget * 2
        if not content or not content.strip():
            with PRINT_LOCK:
                print(f"[warn] {name} {key}: empty content even at {budget} tokens, storing flagged empty", flush=True)
        append_result(out_a, {"item_id": item["id"], "sample": s, "output": content or "", "empty": not (content and content.strip()), "model": name, "ts": time.time()}, lock)
        done.add(key)
        with PRINT_LOCK:
            print(f"[a] {name} {key} ok", flush=True)

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(a_worker, tasks))

    out_b = ROOT / CFG["paths"]["outputs"] / name / "lol_b.jsonl"
    done = done_keys(out_b)
    tasks = [(prem, s) for prem in premises for s in range(nb) if f'{prem["id"]}|{s}' not in done]
    print(f"[b] {name}: {len(tasks)} calls to make", flush=True)
    prompt_cache_b = {
        prem["id"]: render(
            ROOT / "harness" / "prompts" / "generate.md",
            {
                "format": prem["format"],
                "premise": prem["premise"],
                "persona": prem["persona"],
                "edginess_budget": prem["edginess_budget"],
            },
        )
        for prem in premises
    }

    def b_worker(task):
        prem, s = task
        key = f'{prem["id"]}|{s}'
        if spend_exceeded():
            with PRINT_LOCK:
                print(f"[spend-guard] skipping {name} {key}: max_spend_usd reached", flush=True)
            return
        content = None
        budget = mt
        for try_i in range(2):
            try:
                content = chat(provider, model, base_url, [{"role": "user", "content": prompt_cache_b[prem["id"]]}], temp, budget, cost_key=name, extra_payload=extra)
            except Exception as e:
                with PRINT_LOCK:
                    print(f"[warn] {name} {key}: {e}", flush=True)
                return
            if content and content.strip():
                break
            budget = budget * 2
        if not content or not content.strip():
            with PRINT_LOCK:
                print(f"[warn] {name} {key}: empty content even at {budget} tokens, storing flagged empty", flush=True)
        append_result(out_b, {"item_id": prem["id"], "sample": s, "output": content or "", "empty": not (content and content.strip()), "model": name, "ts": time.time()}, lock)
        done.add(key)
        with PRINT_LOCK:
            print(f"[b] {name} {key} ok", flush=True)

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(b_worker, tasks))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("only", nargs="?", default=None, help="run a single candidate by name")
    parser.add_argument("--limit", type=int, default=None, help="cap items/premises (smoke tests)")
    parser.add_argument("--samples", type=int, default=None, help="override sample count (smoke tests)")
    args = parser.parse_args()

    load_env()
    items = load_jsonl(ROOT / CFG["paths"]["items_a"])
    premises = load_jsonl(ROOT / CFG["paths"]["premises_b"])
    if args.limit:
        items = items[: args.limit]
        premises = premises[: args.limit]
    if args.samples:
        CFG["n_samples"] = args.samples
        CFG["anchor_samples"] = args.samples
        CFG["lol_b_samples"] = args.samples
    cands = [c for c in CFG["candidates"] if c.get("enabled")]
    if args.only:
        cands = [c for c in cands if c["name"] == args.only]
        if not cands:
            print(f"candidate '{args.only}' not found or not enabled")
            return
    if not cands:
        print("No enabled candidates in harness/config.yaml.")
        return
    for cand in cands:
        print(f"=== {cand['name']} ===", flush=True)
        run_candidate(cand, items, premises)
    print("run complete")


if __name__ == "__main__":
    main()

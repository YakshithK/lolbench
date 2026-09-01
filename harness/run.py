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
}

ENV_KEYS = {
    "groq": "GROQ_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "bai": "BAI_API_KEY",
    "tokenrouter": "TOKENROUTER_API_KEY",
    "openrouter": "OPENROUTER_API_KEY",
    "xai": "XAI_API_KEY",
    "hackclub": "HACKCLUB_API_KEY",
}

WINDOWS = {}
PRINT_LOCK = threading.Lock()


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


# Rough per-model USD pricing (per 1M tokens) for spend guarding.
# Reasoning models burn extra hidden output tokens; these are CEILING prices.
MODEL_PRICES = {
    "glm-5.3-flash": (0, 0), "deepseek-v4-flash": (0, 0), "hy3": (0, 0),
    "mimo-v2.5": (0, 0), "qwen3.8-flash": (0, 0),
    "glm-5.3": (1.4, 4.4), "deepseek-v4-pro": (1.6, 3.2),
    "qwen3.8-max": (2, 6), "mimo-v2.5-pro": (0.44, 0.87), "hy4-preview": (0.83, 2.5),
    "gpt-5.6-sol-pro": (2, 10), "gemini-3.1-pro": (2, 12),
    "claude-opus-5": (5, 25), "muse-spark-1.2": (0, 0),  # hackclub free tier
    "grok-4.6": (2, 6),
}
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


def throttle(provider):
    rpm = CFG.get("rate_limits_rpm", {}).get(provider, 0)
    if not rpm:
        return
    w = WINDOWS.setdefault(provider, {"t": time.time(), "n": 0})
    now = time.time()
    if now - w["t"] >= 60:
        w["t"], w["n"] = now, 0
    if w["n"] >= rpm:
        time.sleep(max(0.0, 60 - (now - w["t"])) + 0.5)
        w["t"], w["n"] = time.time(), 0
    w["n"] += 1


def chat(provider, model, base_url, messages, temperature, max_tokens, retries=6, cost_key=None, extra_payload=None):
    url = base_url or PROVIDER_URLS[provider]
    key = os.environ.get(ENV_KEYS.get(provider, ""), "")
    headers = {"Content-Type": "application/json"}
    if key:
        headers["Authorization"] = f"Bearer {key}"
    body = {"model": model, "messages": messages, "temperature": temperature, "max_tokens": max_tokens}
    if extra_payload:
        body.update(extra_payload)
    payload = json.dumps(body).encode("utf-8")
    delay = 2.0
    for attempt in range(retries):
        throttle(provider)
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
    # think: false -> disable reasoning via OpenRouter's unified param (cost control)
    extra = {"reasoning": {"enabled": False}} if (cand.get("think") is False and provider == "openrouter") else None

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

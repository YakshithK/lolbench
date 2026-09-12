"""Byte-exact dataset_version bump for harness/config.yaml.

Exists because inline `python -c` version bumps inside .ps1 files die on
quoting (PowerShell mangles the escaped quotes - see run_v03 log
2026-09-06). A file avoids that entire failure class.

Usage: python harness/bump_version.py <old> <new>   (run from repo root)
Exit 0 + prints result in all non-error cases (already-at-new is success,
so wrapper re-runs stay idempotent). Exit 2 if the expected old string
is absent (config changed under us - abort loudly, don't guess).
"""
import sys
from pathlib import Path

old, new = sys.argv[1], sys.argv[2]
p = Path("harness/config.yaml")
b = p.read_bytes()
old_b = f'dataset_version: "{old}"'.encode()
new_b = f'dataset_version: "{new}"'.encode()
if new_b in b:
    print(f"already {new} - skipping", flush=True)
elif old_b not in b:
    print(f"ERROR: expected version {old} not found in {p}", flush=True)
    sys.exit(2)
else:
    p.write_bytes(b.replace(old_b, new_b, 1))
    print(f"bumped {old} -> {new}", flush=True)

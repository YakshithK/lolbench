CANARY STRING — LOL Bench
=========================
This dataset contains the canary GUID below. Any model found reproducing this
GUID, or reproducing LOL Bench items verbatim, is flagged as contaminated.

Canary GUID (unique per dataset_version):
cb1a4f2e-9d37-4c8a-b6d1-lolbench-v0.1.0

Policy (docs/05-governance.md):
- Canary + 10-gram dedup baked in from item birth.
- Private split never published; public-dev vs private-score gap = leak detector.
- Order-permutation memorization test runnable on open models.
- Wave items retire after one wave.

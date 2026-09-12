# v0.3 cutover + full LOL-A regen. THE command for the v0.3 run.
#
# Resume contract (why re-running this file is always safe):
#  - every step below is idempotent: backups timestamp (never overwrite),
#    the cutover detects already-swapped state and skips re-swapping, the
#    purge drops only rows matching the pre-cutover ID set (second run finds
#    nothing), run.py/judge.py skip completed rows via checkpoint files and
#    retry null/failed rows, score.py is a pure function of files.
#  - kill it with Ctrl+C, lose WiFi, reboot mid-run: re-run this same file
#    and it picks up exactly where it stopped. Nothing completed is repeated,
#    nothing partial is trusted (null/failed rows re-run by design).
#  - purge source selection reads the backup whose content still has
#    F-families (the true pre-cutover file), never a backup taken after the
#    swap - so resume runs can't purge the wrong generation.
#  - DO NOT use harness/run_all.ps1 for this: it purges F6, which v0.3 keeps.

Set-Location (Split-Path $PSScriptRoot -Parent)
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$log = "run_v03.log"

function Step($name, [scriptblock]$cmd) {
    Write-Output "=== [$ts] $name ===" | Tee-Object -FilePath $log -Append
    & $cmd 2>&1 | Tee-Object -FilePath $log -Append
    if ($LASTEXITCODE -ne 0) { Write-Output "FAILED at: $name - fix and re-run .\harness\run_v03.ps1" | Tee-Object -FilePath $log -Append; exit 1 }
}

# 0. staging file must exist (built + reviewed via harness/build_v03.py)
if (-not (Test-Path "data/lol_a_items.v03.jsonl")) { Write-Output "MISSING data/lol_a_items.v03.jsonl - run: python harness/build_v03.py"; exit 1 }

# 1-3. cutover, state-aware: detect whether a previous run already swapped.
$liveHasT = Select-String -Path "data/lol_a_items.jsonl" -Pattern '"family": "T[123]"' -Quiet
$liveHasF = Select-String -Path "data/lol_a_items.jsonl" -Pattern '"family": "F[1-6]"' -Quiet
if (-not $liveHasT -and -not $liveHasF) { Write-Output "live items file has neither T- nor F-families - refusing to guess at state"; exit 1 }
$itemBackup = "data/private/lol_a_items.before-v03-$ts.jsonl"
$judgBackup = "judgments/lol_a_judgments.before-v03-$ts.jsonl"
if (-not $liveHasT) {
    Copy-Item "data/lol_a_items.jsonl" $itemBackup
    if (Test-Path "judgments/lol_a_judgments.jsonl") { Copy-Item "judgments/lol_a_judgments.jsonl" $judgBackup }
    Copy-Item "data/lol_a_items.v03.jsonl" "data/lol_a_items.jsonl"
    Write-Output "cutover done: live items swapped, backups at $itemBackup" | Tee-Object -FilePath $log -Append
} else {
    Write-Output "live items already v0.3 content - swap previously completed, skipping" | Tee-Object -FilePath $log -Append
    if (Test-Path "judgments/lol_a_judgments.jsonl") { Copy-Item "judgments/lol_a_judgments.jsonl" $judgBackup }
}
# purge source = newest pre-cutover backup (must still contain F-families)
$purgeSrc = Get-ChildItem "data/private/lol_a_items.before-v03-*.jsonl" |
    Sort-Object LastWriteTime -Descending |
    Where-Object { Select-String -Path $_.FullName -Pattern '"family": "F' -Quiet } |
    Select-Object -First 1
if (-not $purgeSrc) { Write-Output "no pre-cutover backup with F-families found - aborting before purge"; exit 1 }
Write-Output "purge source: $($purgeSrc.FullName)" | Tee-Object -FilePath $log -Append

# 4-8. version bump (file-based, no inline quoting) + purge + chain, all gated
Step "dataset_version 0.2.0 -> 0.3.0" { python harness/bump_version.py 0.2.0 0.3.0 }
Step "purge_v03 (F1-F5 out, F6 kept, idempotent)" { python harness/purge_v03.py --items-backup $purgeSrc.FullName }
Step "run.py (LOL-A regen; LOL-B no-op via checkpoints)" { python harness/run.py }
Step "judge.py (T1/T2/T3 route to judge_f6.md; nulls retry)" { python harness/judge.py }
Step "score.py (rebuilds site/results.json + matchups.json)" { python harness/score.py }

Write-Output "run_v03.ps1 complete - review site/results.json, then commit + push to deploy" | Tee-Object -FilePath $log -Append

python purge_f6.py
if ($LASTEXITCODE -ne 0) { Write-Output "purge_f6.py failed, stopping"; exit 1 }

python run.py
if ($LASTEXITCODE -ne 0) { Write-Output "run.py failed, stopping"; exit 1 }

python judge.py
if ($LASTEXITCODE -ne 0) { Write-Output "judge.py failed, stopping"; exit 1 }

python score.py
Write-Output "run_all.ps1 complete"

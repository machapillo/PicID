$ErrorActionPreference = 'Stop'
function Step($msg){ Write-Host "=== $msg ===" }

Step "Check git version"
git --version

Step "Enable long paths"
git config --global core.longpaths true

Step "Set git user if missing"
if (-not (git config --get user.name))  { git config --global user.name  'YOUR_NAME' }
if (-not (git config --get user.email)) { git config --global user.email 'YOUR_EMAIL@example.com' }

Step "Init repo on main if needed"
if (!(Test-Path .git)) {
  git init -b main 2>$null
  if ($LASTEXITCODE -ne 0) { git init; git checkout -b main }
}

Step "Current branch"
git branch --show-current

Step "Add and commit"
git add .
# 何もステージされていない場合はコミットしない
try { git diff --cached --quiet; $hasStaged = $LASTEXITCODE -ne 0 } catch { $hasStaged = $false }
if ($hasStaged) {
  git commit -m "chore: initial commit"
} else {
  Write-Host "No changes to commit"
}

Step "Configure remote origin"
$remoteUrl = 'https://github.com/machapillo/PicID'
$remotes = git remote
if ($remotes -match '^origin$') {
  git remote set-url origin $remoteUrl
} else {
  git remote add origin $remoteUrl
}

git remote -v

Step "Check remote main and rebase if exists"
$hasMain = git ls-remote --heads origin main
if ($hasMain) {
  git fetch origin main
  git pull --rebase origin main
} else {
  Write-Host "Remote main not found; will create on push."
}

Step "Push to origin/main"
git push -u origin main
Write-Host "=== DONE ==="

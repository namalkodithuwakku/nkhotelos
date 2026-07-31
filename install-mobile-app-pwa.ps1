$ErrorActionPreference = "Stop"

$projectRoot = "E:\NK Labs\NK Hotel OS"
$packageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$sourceRoot = Join-Path $packageRoot "update-files"
$backupRoot = Join-Path $projectRoot ("mobile-app-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))

$files = @(
  "app\components\os\PersistentOSLayout.tsx",
  "app\components\os\PersistentOSLayout.module.css",
  "app\components\pwa\PwaManager.tsx",
  "app\globals.css",
  "app\layout.tsx",
  "public\manifest.webmanifest",
  "public\sw.js"
)

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

foreach ($relative in $files) {
  $source = Join-Path $sourceRoot $relative
  $target = Join-Path $projectRoot $relative
  $backup = Join-Path $backupRoot $relative

  if (-not (Test-Path -LiteralPath $source)) {
    throw "Missing update file: $source"
  }

  if (Test-Path -LiteralPath $target) {
    New-Item -ItemType Directory -Path (Split-Path -Parent $backup) -Force | Out-Null
    Copy-Item -LiteralPath $target -Destination $backup -Force
  }

  New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
  Copy-Item -LiteralPath $source -Destination $target -Force
}

Write-Host ""
Write-Host "N K Hotel OS mobile app update installed." -ForegroundColor Green
Write-Host "Desktop layout remains controlled by the existing desktop CSS." -ForegroundColor Cyan
Write-Host "Backup created at: $backupRoot" -ForegroundColor Yellow
Write-Host ""

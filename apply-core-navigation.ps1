$ErrorActionPreference = "Stop"
$page = Join-Path $PSScriptRoot "app\page.tsx"

if (-not (Test-Path $page)) {
  throw "app\page.tsx not found."
}

$content = Get-Content $page -Raw

# Change Property & Rooms card from /property to /rooms.
$content = $content -replace '(\["Property & Rooms"[\s\S]{0,160}?)"/property"', '$1"/rooms"'

# Add Rooms link after Property where the menu uses tuple arrays.
if ($content -notmatch '"/rooms"') {
  $content = $content -replace '(\["Property",\s*"/property",\s*Building2\],)', '$1`r`n  ["Rooms", "/rooms", Building2],'
}

Set-Content $page $content -Encoding utf8
Write-Host "Core navigation updated."

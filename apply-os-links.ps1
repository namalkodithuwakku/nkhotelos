$ErrorActionPreference = "Stop"

$pagePath = Join-Path $PSScriptRoot "app\page.tsx"

if (-not (Test-Path $pagePath)) {
    throw "app\page.tsx was not found. Run this script from the N K Hotel OS project folder."
}

$content = Get-Content $pagePath -Raw

# Menu-array forms
$content = $content -replace '(\["Booking Calendar",\s*)"/legacy-dashboard"', '$1"/calendar"'
$content = $content -replace '(\["Occupancy",\s*)"/legacy-dashboard"', '$1"/occupancy"'
$content = $content -replace '(\["Revenue Manager",\s*)"/legacy-dashboard"', '$1"/revenue-manager"'

# Object forms
$content = $content -replace '(title:\s*"Booking Calendar"[\s\S]{0,180}?href:\s*)"/legacy-dashboard"', '$1"/calendar"'
$content = $content -replace '(title:\s*"Occupancy"[\s\S]{0,180}?href:\s*)"/legacy-dashboard"', '$1"/occupancy"'
$content = $content -replace '(title:\s*"Revenue Manager"[\s\S]{0,180}?href:\s*)"/legacy-dashboard"', '$1"/revenue-manager"'

# Compact card tuple forms
$content = $content -replace '(\["Booking Calendar"[^]]*?,\s*)"/legacy-dashboard"', '$1"/calendar"'
$content = $content -replace '(\["Occupancy"[^]]*?,\s*)"/legacy-dashboard"', '$1"/occupancy"'
$content = $content -replace '(\["Revenue Manager"[^]]*?,\s*)"/legacy-dashboard"', '$1"/revenue-manager"'

Set-Content $pagePath $content -Encoding utf8

Write-Host "OS module links updated:"
Write-Host "  Booking Calendar -> /calendar"
Write-Host "  Occupancy        -> /occupancy"
Write-Host "  Revenue Manager  -> /revenue-manager"

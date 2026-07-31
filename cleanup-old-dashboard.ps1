$ErrorActionPreference = "Stop"

$project = $PSScriptRoot

Write-Host "Cleaning active Staff Dashboard leftovers from N K Hotel OS..." -ForegroundColor Cyan

$legacyRoute = Join-Path $project "app\legacy-dashboard"
if (Test-Path $legacyRoute) {
    Remove-Item $legacyRoute -Recurse -Force
    Write-Host "Removed app\legacy-dashboard" -ForegroundColor Green
}

# Remove old generated helper scripts and planning-only files from the project root.
$rootTrash = @(
    "apply-os-links.ps1",
    "apply-core-navigation.ps1",
    "SIMPLE_UI_INSTALL.md",
    "INSTALL_DIRECT_MODULE_ROUTES.md",
    "ALL_PAGES_INSTALL.md",
    "CORE_OPERATIONS_INSTALL.md",
    "PREMIUM_UI_INSTALL.md"
)

foreach ($item in $rootTrash) {
    $path = Join-Path $project $item
    if (Test-Path $path) {
        Remove-Item $path -Force
        Write-Host "Removed $item" -ForegroundColor DarkGray
    }
}

# Old CSS files are left on disk only if another copied component still references
# them directly. They are no longer imported by app/globals.css and therefore do
# not affect the live Hotel OS UI.

Write-Host ""
Write-Host "Cleanup complete. Active UI now uses only N K Hotel OS styles." -ForegroundColor Green

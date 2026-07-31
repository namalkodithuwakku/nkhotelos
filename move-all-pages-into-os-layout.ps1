$ErrorActionPreference = "Stop"

$project = $PSScriptRoot
$osGroup = Join-Path $project "app\(os)"

New-Item -ItemType Directory -Force -Path $osGroup | Out-Null

$routes = @(
    "calendar",
    "occupancy",
    "revenue-manager",
    "marketing-manager",
    "reputation-manager",
    "tools",
    "actions",
    "qr-menu",
    "reports",
    "property",
    "rooms",
    "staff",
    "notifications",
    "settings"
)

Write-Host ""
Write-Host "Moving all protected Hotel OS pages into app\(os)..." -ForegroundColor Cyan
Write-Host ""

foreach ($route in $routes) {
    $source = Join-Path $project "app\$route"
    $target = Join-Path $osGroup $route

    if (-not (Test-Path $source)) {
        if (Test-Path $target) {
            Write-Host "/$route is already inside the persistent layout." -ForegroundColor DarkGray
        }
        else {
            Write-Host "/$route was not found. Skipping." -ForegroundColor Yellow
        }
        continue
    }

    if (Test-Path $target) {
        Remove-Item $target -Recurse -Force
    }

    Move-Item $source $target
    Write-Host "Moved /$route" -ForegroundColor Green

    Get-ChildItem $target -Recurse -File -Include *.ts,*.tsx | ForEach-Object {
        $content = Get-Content $_.FullName -Raw

        # Files moved one directory deeper:
        # app/route -> app/(os)/route
        $content = $content.Replace('from "../components/', 'from "../../components/')
        $content = $content.Replace("from '../components/", "from '../../components/")
        $content = $content.Replace('from "../lib/', 'from "../../lib/')
        $content = $content.Replace("from '../lib/", "from '../../lib/")
        $content = $content.Replace('from "../hooks/', 'from "../../hooks/')
        $content = $content.Replace("from '../hooks/", "from '../../hooks/")

        Set-Content -Path $_.FullName -Value $content -Encoding utf8
    }
}

$legacyDashboard = Join-Path $project "app\legacy-dashboard"
if (Test-Path $legacyDashboard) {
    Remove-Item $legacyDashboard -Recurse -Force
    Write-Host "Removed old /legacy-dashboard route." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Route migration complete." -ForegroundColor Cyan
Write-Host ""
Write-Host "All protected URLs now inherit app\(os)\layout.tsx:" -ForegroundColor White
Write-Host "/dashboard, /calendar, /occupancy, /revenue-manager, /marketing-manager,"
Write-Host "/reputation-manager, /tools, /actions, /qr-menu, /reports, /property,"
Write-Host "/rooms, /staff, /notifications and /settings."
Write-Host ""

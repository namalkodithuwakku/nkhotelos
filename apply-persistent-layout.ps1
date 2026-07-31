$ErrorActionPreference = "Stop"
$project = $PSScriptRoot
$group = Join-Path $project "app\(os)"
New-Item -ItemType Directory -Force -Path $group | Out-Null

$routes = @(
  "calendar","occupancy","revenue-manager","marketing-manager","reputation-manager",
  "tools","actions","qr-menu","reports","property","rooms","staff","notifications","settings"
)

foreach ($route in $routes) {
  $source = Join-Path $project "app\$route"
  $target = Join-Path $group $route

  if (Test-Path $source) {
    if (Test-Path $target) { Remove-Item $target -Recurse -Force }
    Move-Item $source $target
    Write-Host "Moved /$route into persistent OS layout" -ForegroundColor Green

    Get-ChildItem $target -Recurse -Include *.ts,*.tsx | ForEach-Object {
      $text = Get-Content $_.FullName -Raw
      $text = $text -replace 'from "\.\./components/', 'from "../../components/'
      $text = $text -replace 'from "\.\./lib/', 'from "../../lib/'
      Set-Content $_.FullName $text -Encoding utf8
    }
  }
}

# Replace route page wrappers so the shared layout is not duplicated.
$pages = @{
  "calendar" = 'import CalendarWorkspace from "../../components/calendar/CalendarWorkspace"; export default function Page(){return <CalendarWorkspace/>}'
  "occupancy" = 'import OccupancyInventoryWorkspace from "../../components/occupancy/OccupancyInventoryWorkspace"; export default function Page(){return <OccupancyInventoryWorkspace/>}'
  "revenue-manager" = 'import RevenueManagerWorkspace from "../../components/revenue/RevenueManagerWorkspace"; export default function Page(){return <RevenueManagerWorkspace/>}'
  "actions" = 'import ActionsManager from "./ActionsManager"; export default function Page(){return <ActionsManager/>}'
  "notifications" = 'import NotificationsManager from "./NotificationsManager"; export default function Page(){return <NotificationsManager/>}'
  "settings" = 'import SettingsManager from "./SettingsManager"; export default function Page(){return <SettingsManager/>}'
  "staff" = 'import StaffManager from "./StaffManager"; export default function Page(){return <StaffManager/>}'
  "rooms" = 'import RoomsManager from "./RoomsManager"; export default function Page(){return <RoomsManager/>}'
  "property" = 'import PropertyEditor from "./PropertyEditor"; export default function Page(){return <PropertyEditor/>}'
}

foreach ($key in $pages.Keys) {
  $path = Join-Path $group "$key\page.tsx"
  if (Test-Path (Split-Path $path)) {
    Set-Content $path $pages[$key] -Encoding utf8
  }
}

Write-Host ""
Write-Host "Persistent protected layout installed." -ForegroundColor Cyan
Write-Host "Dashboard is now /dashboard and login is /login." -ForegroundColor Cyan

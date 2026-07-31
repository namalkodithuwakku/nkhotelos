$ErrorActionPreference = "Stop"

$projectRoot = "E:\NK Labs\NK Hotel OS"
$calendarPath = Join-Path $projectRoot "app\components\calendar\CalendarWorkspace.tsx"

if (-not (Test-Path $calendarPath)) {
    throw "Could not find CalendarWorkspace.tsx"
}

$content = Get-Content -LiteralPath $calendarPath -Raw

$importAnchor = 'import { CalendarDays, ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus, RefreshCw } from "lucide-react";'
$importReplacement = @'
import { CalendarDays, ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus, RefreshCw } from "lucide-react";
import CalendarSessionRepair from "./CalendarSessionRepair";
'@

if (
    $content.Contains($importAnchor) -and
    -not $content.Contains('import CalendarSessionRepair from "./CalendarSessionRepair";')
) {
    $content = $content.Replace($importAnchor, $importReplacement)
}

$oldError = 'if (error) return <div className="calendar-error"><span>{error}</span><button onClick={() => void load(propertyId, month)}>Try again</button></div>;'
$newError = 'if (error === "Please sign in again.") return <CalendarSessionRepair onReady={() => void load(propertyId, month)} />; if (error) return <div className="calendar-error"><span>{error}</span><button onClick={() => void load(propertyId, month)}>Try again</button></div>;'

if ($content.Contains($oldError)) {
    $content = $content.Replace($oldError, $newError)
} elseif (-not $content.Contains('<CalendarSessionRepair onReady=')) {
    throw "Could not find the Calendar error renderer. CalendarWorkspace was not changed."
}

Set-Content -LiteralPath $calendarPath -Value $content -Encoding UTF8

Write-Host ""
Write-Host "Calendar session repair installed." -ForegroundColor Green
Write-Host ""

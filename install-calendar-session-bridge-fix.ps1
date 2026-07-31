$ErrorActionPreference = "Stop"

$projectRoot = "E:\NK Labs\NK Hotel OS"
$calendarPath = Join-Path $projectRoot "app\components\calendar\CalendarWorkspace.tsx"

if (-not (Test-Path $calendarPath)) {
    throw "Could not find: $calendarPath"
}

$content = Get-Content -LiteralPath $calendarPath -Raw

# Add CalendarSessionRepair import.
$importAnchor = 'import { CalendarDays, ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus, RefreshCw } from "lucide-react";'
$importLine = 'import CalendarSessionRepair from "./CalendarSessionRepair";'

if (-not $content.Contains($importLine)) {
    if (-not $content.Contains($importAnchor)) {
        throw "Could not find the lucide-react import."
    }

    $content = $content.Replace(
        $importAnchor,
        "$importAnchor`r`n$importLine"
    )
}

# Replace the exact current Calendar error renderer.
$oldBlock = @'
    {error ? <div className="calendar-message error">{error}<button onClick={() => void load()}>Try again</button></div>
      : !nativeMode && !data.property?.calendar_sheet_code ? <div className="calendar-message"><CalendarDays/><h3>Calendar source not connected</h3><p>Add this property’s Google Sheet URL under Properties → Edit overview.</p></div>
'@

$newBlock = @'
    {error === "Please sign in again." ? <CalendarSessionRepair onReady={() => void load(propertyId, month)} />
      : error ? <div className="calendar-message error">{error}<button onClick={() => void load()}>Try again</button></div>
      : !nativeMode && !data.property?.calendar_sheet_code ? <div className="calendar-message"><CalendarDays/><h3>Calendar source not connected</h3><p>Add this property’s Google Sheet URL under Properties → Edit overview.</p></div>
'@

if ($content.Contains($oldBlock)) {
    $content = $content.Replace($oldBlock, $newBlock)
} elseif (-not $content.Contains('error === "Please sign in again." ? <CalendarSessionRepair')) {
    throw "Could not find the current Calendar JSX error block."
}

Set-Content -LiteralPath $calendarPath -Value $content -Encoding UTF8

Write-Host ""
Write-Host "Calendar session bridge patch installed successfully." -ForegroundColor Green
Write-Host ""

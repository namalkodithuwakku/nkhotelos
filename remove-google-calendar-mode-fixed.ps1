$ErrorActionPreference = "Stop"

$projectRoot = "E:\NK Labs\NK Hotel OS"
$path = Join-Path $projectRoot "app\components\calendar\CalendarWorkspace.tsx"

if (-not (Test-Path $path)) {
    throw "Could not find CalendarWorkspace.tsx"
}

$content = Get-Content -LiteralPath $path -Raw

# Force Hotel OS native Supabase mode.
$content = $content.Replace(
    'const nativeMode = data.property?.calendar_source_mode === "supabase";',
    'const nativeMode = true;'
)

# Remove the old Google Sheet connection message.
$pattern = '(?s): !nativeMode && !data\.property\?\.calendar_sheet_code \? <div className="calendar-message">.*?</div>\s*: !loading && !roomNames\.length \? <div className="calendar-message">.*?</div>'

$replacement = ': !loading && !roomNames.length ? <div className="calendar-message"><CalendarDays/><h3>No rooms available</h3><p>Save active rooms under Property - Individual Rooms. They will appear here automatically.</p></div>'

$content = [regex]::Replace($content, $pattern, $replacement, 1)

# Replace old Google Sheet wording.
$content = $content.Replace(
    '{nativeMode ? "Live booking calendar managed directly in NKH Dashboard." : "Read-only booking view copied from the property Google Sheet."}',
    '"Live booking calendar managed directly by N K Hotel OS."'
)

# Replace legacy status wording.
$content = $content.Replace(
    '<span className={data.sync?.last_status === "Ready" || nativeMode ? "ready" : ""}><i />{nativeMode ? "Dashboard calendar active" : backgroundSyncing ? "Checking source in background" : data.sync?.last_status || "Waiting for first sync"}</span>',
    '<span className="ready"><i />Hotel OS calendar active</span>'
)

$content = $content.Replace(
    '<span>{nativeMode ? "Live Supabase data" : data.sync?.last_completed_at ? `Updated ${new Date(data.sync.last_completed_at).toLocaleString()}` : "No calendar copy received yet"}</span>',
    '<span>Live property room inventory</span>'
)

Set-Content -LiteralPath $path -Value $content -Encoding UTF8

Write-Host ""
Write-Host "Google Sheet Calendar mode removed successfully." -ForegroundColor Green
Write-Host ""

$ErrorActionPreference = "Stop"

$projectRoot = "E:\NK Labs\NK Hotel OS"

$cssFile = Get-ChildItem -Path (Join-Path $projectRoot "app") -Recurse -File -Filter "*.css" |
    Where-Object {
        $content = Get-Content -LiteralPath $_.FullName -Raw
        $content -match '\.calendar-booking\.fit' -or
        $content -match '\.calendar-booking\.booking'
    } |
    Select-Object -First 1

if (-not $cssFile) {
    throw "Could not locate the Calendar stylesheet."
}

$content = Get-Content -LiteralPath $cssFile.FullName -Raw

$styles = @{
    "fit" = @'
.calendar-booking.fit{
  background:
    radial-gradient(circle at 18% 20%,rgba(255,255,255,.34),transparent 34%),
    linear-gradient(135deg,#EBC267,#E2A843)!important;
  border-color:#D39B38!important;
  color:#46340F!important;
}
'@
    "booking" = @'
.calendar-booking.booking{
  background:
    radial-gradient(circle at 18% 20%,rgba(255,255,255,.22),transparent 34%),
    linear-gradient(135deg,#78BBC0,#5AA8AE)!important;
  border-color:#4F979D!important;
  color:#FFFFFF!important;
}
'@
    "expedia" = @'
.calendar-booking.expedia{
  background:
    radial-gradient(circle at 18% 20%,rgba(255,255,255,.20),transparent 34%),
    linear-gradient(135deg,#E29559,#D47C37)!important;
  border-color:#C76D2D!important;
  color:#FFFFFF!important;
}
'@
    "agoda" = @'
.calendar-booking.agoda{
  background:
    radial-gradient(circle at 18% 20%,rgba(255,255,255,.18),transparent 34%),
    linear-gradient(135deg,#AD6A9C,#965388)!important;
  border-color:#844776!important;
  color:#FFFFFF!important;
}
'@
    "airbnb" = @'
.calendar-booking.airbnb{
  background:
    radial-gradient(circle at 18% 20%,rgba(255,255,255,.18),transparent 34%),
    linear-gradient(135deg,#BF6B63,#A95049)!important;
  border-color:#98453F!important;
  color:#FFFFFF!important;
}
'@
    "agent" = @'
.calendar-booking.agent{
  background:
    radial-gradient(circle at 18% 20%,rgba(255,255,255,.18),transparent 34%),
    linear-gradient(135deg,#8AA460,#708B4C)!important;
  border-color:#60783E!important;
  color:#FFFFFF!important;
}
'@
    "blocked" = @'
.calendar-booking.blocked{
  background:
    radial-gradient(circle at 18% 20%,rgba(255,255,255,.12),transparent 34%),
    linear-gradient(135deg,#716278,#5B4C63)!important;
  border-color:#4C3F53!important;
  color:#FFFFFF!important;
}
'@
}

foreach ($name in $styles.Keys) {
    $pattern = "(?s)\.calendar-booking\.$name\s*\{.*?\}"

    if ([regex]::IsMatch($content, $pattern)) {
        $content = [regex]::Replace(
            $content,
            $pattern,
            $styles[$name].Trim(),
            1
        )
    }
    else {
        $content += "`r`n" + $styles[$name]
    }
}

$legend = @{
    "fit" = "#E5B455"
    "booking" = "#68ADB3"
    "expedia" = "#D88440"
    "agoda" = "#A15D90"
    "airbnb" = "#B45A52"
    "agent" = "#7C9653"
    "blocked" = "#63546B"
}

foreach ($name in $legend.Keys) {
    $pattern = "(?s)\.calendar-legend\s+\.$name\s*\{.*?\}"
    $replacement = ".calendar-legend .$name{background:$($legend[$name])!important}"

    if ([regex]::IsMatch($content, $pattern)) {
        $content = [regex]::Replace(
            $content,
            $pattern,
            $replacement,
            1
        )
    }
    else {
        $content += "`r`n$replacement"
    }
}

# Slightly soften booking shadows without changing layout.
$shadowBlock = @'

/* N K HOTEL OS SOFT AURORA BOOKING POLISH */
.calendar-booking{
  box-shadow:
    0 2px 5px rgba(28,47,58,.10),
    inset 0 1px 0 rgba(255,255,255,.15)!important;
}
.calendar-booking strong{
  font-weight:800!important;
}
.calendar-booking small{
  opacity:.86!important;
}
'@

if ($content -notmatch 'N K HOTEL OS SOFT AURORA BOOKING POLISH') {
    $content += $shadowBlock
}

Set-Content -LiteralPath $cssFile.FullName -Value $content -Encoding UTF8

Write-Host ""
Write-Host "Soft Aurora Calendar colors installed successfully." -ForegroundColor Green
Write-Host "Updated stylesheet: $($cssFile.FullName)" -ForegroundColor Cyan
Write-Host ""

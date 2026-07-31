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
    radial-gradient(circle at 18% 18%,rgba(255,255,255,.24),transparent 32%),
    linear-gradient(135deg,#E6BB3D,#D9A922)!important;
  border-color:#C99718!important;
  color:#2D291C!important;
}
'@
    "booking" = @'
.calendar-booking.booking{
  background:
    radial-gradient(circle at 18% 18%,rgba(255,255,255,.16),transparent 32%),
    linear-gradient(135deg,#3778BE,#2D68AD)!important;
  border-color:#285C98!important;
  color:#FFFFFF!important;
}
'@
    "expedia" = @'
.calendar-booking.expedia{
  background:
    radial-gradient(circle at 18% 18%,rgba(255,255,255,.14),transparent 32%),
    linear-gradient(135deg,#EA8A34,#DE7721)!important;
  border-color:#CA6919!important;
  color:#FFFFFF!important;
}
'@
    "agoda" = @'
.calendar-booking.agoda{
  background:
    radial-gradient(circle at 18% 18%,rgba(255,255,255,.12),transparent 32%),
    linear-gradient(135deg,#8B7258,#786148)!important;
  border-color:#69543E!important;
  color:#FFFFFF!important;
}
'@
    "airbnb" = @'
.calendar-booking.airbnb{
  background:
    radial-gradient(circle at 18% 18%,rgba(255,255,255,.13),transparent 32%),
    linear-gradient(135deg,#D15A7F,#C1496F)!important;
  border-color:#AD3F61!important;
  color:#FFFFFF!important;
}
'@
    "agent" = @'
.calendar-booking.agent{
  background:
    radial-gradient(circle at 18% 18%,rgba(255,255,255,.13),transparent 32%),
    linear-gradient(135deg,#2F936B,#257F5A)!important;
  border-color:#1F6E4E!important;
  color:#FFFFFF!important;
}
'@
    "blocked" = @'
.calendar-booking.blocked{
  background:
    radial-gradient(circle at 18% 18%,rgba(255,255,255,.10),transparent 32%),
    linear-gradient(135deg,#606A72,#4F5961)!important;
  border-color:#444C53!important;
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
    "fit" = "#DDAE2A"
    "booking" = "#2F6FB6"
    "expedia" = "#E57E25"
    "agoda" = "#80674E"
    "airbnb" = "#C84D74"
    "agent" = "#26865E"
    "blocked" = "#525B63"
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

$polish = @'

/* N K HOTEL OS - NKH DASHBOARD BOOKING PALETTE */
.calendar-booking{
  box-shadow:
    0 3px 7px rgba(27,48,61,.13),
    inset 0 1px 0 rgba(255,255,255,.12)!important;
}
.calendar-booking strong{
  font-weight:800!important;
}
.calendar-booking small{
  opacity:.88!important;
}
'@

if ($content -notmatch 'N K HOTEL OS - NKH DASHBOARD BOOKING PALETTE') {
    $content += $polish
}

Set-Content -LiteralPath $cssFile.FullName -Value $content -Encoding UTF8

Write-Host ""
Write-Host "NKH Dashboard calendar palette installed successfully." -ForegroundColor Green
Write-Host "Updated stylesheet: $($cssFile.FullName)" -ForegroundColor Cyan
Write-Host ""

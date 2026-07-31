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
  background:linear-gradient(135deg,#F0C276,#E5AA4D)!important;
  border-color:#D69A38!important;
  color:#4A3508!important;
}
'@
    "booking" = @'
.calendar-booking.booking{
  background:linear-gradient(135deg,#79BCC0,#58A4AA)!important;
  border-color:#4D969D!important;
  color:#FFFFFF!important;
}
'@
    "expedia" = @'
.calendar-booking.expedia{
  background:linear-gradient(135deg,#E99A60,#D87935)!important;
  border-color:#C96B2B!important;
  color:#FFFFFF!important;
}
'@
    "agoda" = @'
.calendar-booking.agoda{
  background:linear-gradient(135deg,#B070A0,#965486)!important;
  border-color:#854776!important;
  color:#FFFFFF!important;
}
'@
    "airbnb" = @'
.calendar-booking.airbnb{
  background:linear-gradient(135deg,#C06C65,#AA4D47)!important;
  border-color:#98423D!important;
  color:#FFFFFF!important;
}
'@
    "agent" = @'
.calendar-booking.agent{
  background:linear-gradient(135deg,#89A75E,#708B48)!important;
  border-color:#607B3A!important;
  color:#FFFFFF!important;
}
'@
    "blocked" = @'
.calendar-booking.blocked{
  background:linear-gradient(135deg,#716177,#57475E)!important;
  border-color:#493B50!important;
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

$legendStyles = @{
    "fit" = "#E8B75A"
    "booking" = "#68AEB4"
    "expedia" = "#DD873F"
    "agoda" = "#A36191"
    "airbnb" = "#B85E57"
    "agent" = "#7F9A54"
    "blocked" = "#64536B"
}

foreach ($name in $legendStyles.Keys) {
    $pattern = "(?s)\.calendar-legend\s+\.$name\s*\{.*?\}"
    $replacement = ".calendar-legend .$name{background:$($legendStyles[$name])!important}"
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

Set-Content -LiteralPath $cssFile.FullName -Value $content -Encoding UTF8

Write-Host ""
Write-Host "Soft Calendar color palette installed." -ForegroundColor Green
Write-Host "Updated stylesheet: $($cssFile.FullName)" -ForegroundColor Cyan
Write-Host ""

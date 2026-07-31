$ErrorActionPreference = "Stop"

$projectRoot = "E:\NK Labs\NK Hotel OS"
$calendarPath = Join-Path $projectRoot "app\components\calendar\CalendarWorkspace.tsx"
$bookingApiPath = Join-Path $projectRoot "app\api\calendar\bookings\route.ts"

if (-not (Test-Path $calendarPath)) {
    throw "Could not find CalendarWorkspace.tsx"
}

if (-not (Test-Path $bookingApiPath)) {
    throw "Could not find Calendar bookings API route."
}

$calendar = Get-Content -LiteralPath $calendarPath -Raw
$bookingApi = Get-Content -LiteralPath $bookingApiPath -Raw

# ---------------------------------------------------------
# 1. Add the Lucide X icon for reliable close buttons.
# ---------------------------------------------------------
$calendar = $calendar.Replace(
    'CalendarDays, ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus, RefreshCw',
    'CalendarDays, ChevronLeft, ChevronRight, Maximize2, Minimize2, Minus, Plus, RefreshCw, X'
)

# Replace the broken/weak text close buttons in all Calendar modals.
$calendar = $calendar.Replace(
    '<button type="button" className="modal-close" onClick={() => { setEditing(null); setDraft(null); }}>×</button>',
    '<button type="button" className="modal-close" aria-label="Close booking window" onClick={() => { setEditing(null); setDraft(null); }}><X size={18}/></button>'
)

$calendar = $calendar.Replace(
    '<button type="button" className="modal-close" onClick={() => setCancelTarget(null)}>×</button>',
    '<button type="button" className="modal-close" aria-label="Close cancellation window" onClick={() => setCancelTarget(null)}><X size={18}/></button>'
)

$calendar = $calendar.Replace(
    '<button type="button" className="modal-close" onClick={() => setDeleteTarget(null)}>×</button>',
    '<button type="button" className="modal-close" aria-label="Close deletion window" onClick={() => setDeleteTarget(null)}><X size={18}/></button>'
)

# ---------------------------------------------------------
# 2. FIT becomes the only direct-enquiry source.
# ---------------------------------------------------------
$calendar = $calendar.Replace(
    '"Travel Agent": "agent", Blocked: "blocked", Direct: "direct", FIT: "fit",',
    '"Travel Agent": "agent", Blocked: "blocked", FIT: "fit",'
)

$calendar = $calendar.Replace(
    'editing === "new" ? "Direct" : editing.booking_source',
    'editing === "new" ? "FIT" : editing.booking_source === "Direct" ? "FIT" : editing.booking_source'
)

$calendar = $calendar.Replace(
    '["Direct","Booking.com","Agoda","Expedia","Airbnb","Travel Agent","FIT","Blocked"]',
    '["FIT","Booking.com","Agoda","Expedia","Airbnb","Travel Agent","Blocked"]'
)

$calendar = $calendar.Replace(
    '["Booking.com","Expedia","Airbnb","Agoda","Travel Agent","Direct","FIT","Blocked"]',
    '["FIT","Booking.com","Expedia","Airbnb","Agoda","Travel Agent","Blocked"]'
)

# Ensure old Direct records display as FIT in details and booking cards.
$calendar = $calendar.Replace(
    '<small>{booking.booking_source}</small>',
    '<small>{booking.booking_source === "Direct" ? "FIT" : booking.booking_source}</small>'
)

$calendar = $calendar.Replace(
    '<div><dt>Source</dt><dd>{selected.booking_source}</dd></div>',
    '<div><dt>Source</dt><dd>{selected.booking_source === "Direct" ? "FIT" : selected.booking_source}</dd></div>'
)

# ---------------------------------------------------------
# 3. Better modal interaction and no accidental page scroll.
# ---------------------------------------------------------
$calendar = $calendar.Replace(
    '{editing && data.property && <div className="calendar-detail-backdrop"><form className="calendar-booking-form"',
    '{editing && data.property && <div className="calendar-detail-backdrop" onClick={() => { setEditing(null); setDraft(null); }}><form className="calendar-booking-form" onClick={event => event.stopPropagation()}'
)

# FIT API fallback.
$bookingApi = $bookingApi.Replace(
    'booking_source: String(input.booking_source || "Direct").trim(),',
    'booking_source: String(input.booking_source || "FIT").trim() === "Direct" ? "FIT" : String(input.booking_source || "FIT").trim(),'
)

Set-Content -LiteralPath $calendarPath -Value $calendar -Encoding UTF8
Set-Content -LiteralPath $bookingApiPath -Value $bookingApi -Encoding UTF8

# ---------------------------------------------------------
# 4. Locate the existing Calendar CSS and append premium UI.
# ---------------------------------------------------------
$cssFile = Get-ChildItem -Path (Join-Path $projectRoot "app") -Recurse -File -Filter "*.css" |
    Where-Object {
        (Get-Content -LiteralPath $_.FullName -Raw) -match '\.calendar-booking-form'
    } |
    Select-Object -First 1

if (-not $cssFile) {
    throw "Could not locate the Calendar CSS file containing .calendar-booking-form"
}

$css = Get-Content -LiteralPath $cssFile.FullName -Raw

if ($css -notmatch 'NK HOTEL OS CALENDAR FIT PREMIUM UPDATE') {
$premiumCss = @'

/* NK HOTEL OS CALENDAR FIT PREMIUM UPDATE */
.calendar-detail-backdrop{
  padding:clamp(10px,2vw,24px)!important;
  overflow:auto!important;
  overscroll-behavior:contain;
  background:rgba(20,31,40,.58)!important;
  backdrop-filter:blur(7px);
}
.calendar-booking-form{
  position:relative!important;
  width:min(860px,calc(100vw - 24px))!important;
  max-width:860px!important;
  max-height:calc(100vh - 28px)!important;
  overflow-x:hidden!important;
  overflow-y:auto!important;
  margin:auto!important;
  padding:28px 28px 0!important;
  border:1px solid rgba(28,71,92,.12)!important;
  border-radius:22px!important;
  background:#fff!important;
  box-shadow:0 28px 80px rgba(9,29,41,.25)!important;
}
.calendar-booking-form>small{
  display:block;
  padding-right:50px;
  color:#168c76!important;
  font-size:10px!important;
  font-weight:900!important;
  letter-spacing:.13em!important;
}
.calendar-booking-form>h3{
  margin:7px 52px 22px 0!important;
  color:#173f52!important;
  font-size:26px!important;
  line-height:1.15!important;
}
.calendar-booking-form .modal-close,
.calendar-cancel-form .modal-close{
  position:absolute!important;
  top:18px!important;
  right:18px!important;
  z-index:5!important;
  width:38px!important;
  height:38px!important;
  display:grid!important;
  place-items:center!important;
  padding:0!important;
  border:1px solid #d5e0e5!important;
  border-radius:11px!important;
  background:#f7fafb!important;
  color:#244f62!important;
  cursor:pointer!important;
  transition:.18s ease!important;
}
.calendar-booking-form .modal-close:hover,
.calendar-cancel-form .modal-close:hover{
  background:#fff0f1!important;
  border-color:#efc9cd!important;
  color:#c33f4a!important;
  transform:translateY(-1px);
}
.calendar-booking-form .booking-form-grid{
  gap:16px!important;
}
.calendar-booking-form .booking-form-grid>label{
  gap:7px!important;
  color:#526b79!important;
  font-size:10px!important;
  font-weight:850!important;
}
.calendar-booking-form input,
.calendar-booking-form select,
.calendar-booking-form textarea{
  min-height:43px!important;
  box-sizing:border-box!important;
  border:1px solid #d4e0e5!important;
  border-radius:11px!important;
  background:#fff!important;
  color:#173f52!important;
  padding:10px 12px!important;
  font:inherit!important;
  font-size:12px!important;
  outline:none!important;
}
.calendar-booking-form input:focus,
.calendar-booking-form select:focus,
.calendar-booking-form textarea:focus{
  border-color:#30977f!important;
  box-shadow:0 0 0 3px rgba(22,151,119,.11)!important;
}
.booking-room-selector{
  display:flex!important;
  flex-wrap:wrap!important;
  gap:8px!important;
  padding:16px!important;
  border:1px solid #d8e4e8!important;
  border-radius:14px!important;
  background:#f8fbfc!important;
}
.booking-room-selector legend{
  padding:0 7px!important;
  color:#526b79!important;
  font-size:10px!important;
  font-weight:850!important;
}
.booking-room-selector label{
  position:relative!important;
  display:block!important;
}
.booking-room-selector label input{
  position:absolute!important;
  opacity:0!important;
  pointer-events:none!important;
}
.booking-room-selector label span{
  display:flex!important;
  align-items:center!important;
  min-height:36px!important;
  padding:8px 12px!important;
  border:1px solid #d6e2e7!important;
  border-radius:10px!important;
  background:#fff!important;
  color:#526b79!important;
  font-size:11px!important;
  font-weight:850!important;
  cursor:pointer!important;
}
.booking-room-selector label input:checked+span{
  border-color:#159777!important;
  background:#e9f8f3!important;
  color:#08765f!important;
  box-shadow:inset 0 0 0 1px #159777!important;
}
.calendar-booking-form>footer{
  position:sticky!important;
  left:0!important;
  right:0!important;
  bottom:0!important;
  display:flex!important;
  justify-content:flex-end!important;
  gap:10px!important;
  margin:24px -28px 0!important;
  padding:15px 28px!important;
  border-top:1px solid #e2e9ec!important;
  background:rgba(255,255,255,.96)!important;
  backdrop-filter:blur(12px);
}
.calendar-booking-form>footer button{
  min-height:41px!important;
  padding:10px 17px!important;
  border-radius:10px!important;
  font-weight:850!important;
}
.calendar-booking.fit{
  background:linear-gradient(135deg,#087f70,#16a085)!important;
  border-color:#087f70!important;
  color:#fff!important;
}
.calendar-booking.agent{
  background:linear-gradient(135deg,#3b7d38,#66a84f)!important;
  border-color:#3b7d38!important;
  color:#fff!important;
}
.calendar-booking.booking{
  background:linear-gradient(135deg,#1261a0,#2f86d0)!important;
  border-color:#1261a0!important;
  color:#fff!important;
}
.calendar-booking.agoda{
  background:linear-gradient(135deg,#7141a5,#9b66cc)!important;
  border-color:#7141a5!important;
  color:#fff!important;
}
.calendar-booking.airbnb{
  background:linear-gradient(135deg,#c94664,#ef7087)!important;
  border-color:#c94664!important;
  color:#fff!important;
}
.calendar-booking.expedia{
  background:linear-gradient(135deg,#c47a08,#eca92e)!important;
  border-color:#c47a08!important;
  color:#fff!important;
}
.calendar-booking.blocked{
  background:linear-gradient(135deg,#4b5660,#717d86)!important;
  border-color:#4b5660!important;
  color:#fff!important;
}
.calendar-legend .fit{background:#15977a!important}
.calendar-legend .agent{background:#559447!important}
.calendar-legend .booking{background:#2478bd!important}
.calendar-legend .agoda{background:#8755b7!important}
.calendar-legend .airbnb{background:#dc5a73!important}
.calendar-legend .expedia{background:#dc941b!important}
.calendar-legend .blocked{background:#606b74!important}
@media(max-width:720px){
  .calendar-booking-form{
    width:calc(100vw - 14px)!important;
    max-height:calc(100vh - 14px)!important;
    padding:22px 16px 0!important;
    border-radius:17px!important;
  }
  .calendar-booking-form>footer{
    margin:20px -16px 0!important;
    padding:12px 16px!important;
  }
  .calendar-booking-form>footer button{
    flex:1;
  }
}
'@
    Add-Content -LiteralPath $cssFile.FullName -Value $premiumCss
}

Write-Host ""
Write-Host "Calendar FIT and Premium UI update installed." -ForegroundColor Green
Write-Host "Updated CSS: $($cssFile.FullName)" -ForegroundColor Cyan
Write-Host ""

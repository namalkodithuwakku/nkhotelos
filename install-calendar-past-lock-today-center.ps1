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
$api = Get-Content -LiteralPath $bookingApiPath -Raw

# ----------------------------------------------------------
# CALENDAR UI — refs and today's date
# ----------------------------------------------------------

$calendarRefAnchor = 'const calendarRef = useRef<HTMLElement>(null);'
$calendarRefReplacement = @'
const calendarRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const todayHeaderRef = useRef<HTMLDivElement>(null);
'@

if ($calendar.Contains($calendarRefAnchor) -and -not $calendar.Contains('const boardRef = useRef<HTMLDivElement>(null);')) {
    $calendar = $calendar.Replace($calendarRefAnchor, $calendarRefReplacement)
}

$todayAnchor = 'const today = useMemo(() => new Date(), []);'
$todayReplacement = @'
const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => dateKey(today), [today]);
'@

if ($calendar.Contains($todayAnchor) -and -not $calendar.Contains('const todayKey = useMemo')) {
    $calendar = $calendar.Replace($todayAnchor, $todayReplacement)
}

# ----------------------------------------------------------
# Center today's column under Today button
# ----------------------------------------------------------

$effectAnchor = 'useEffect(() => { if (propertyReady) void load(propertyId, month); }, [month, propertyId, propertyReady, load]);'
$effectReplacement = @'
useEffect(() => { if (propertyReady) void load(propertyId, month); }, [month, propertyId, propertyReady, load]);

  const centerTodayColumn = useCallback(() => {
    const board = boardRef.current;
    const header = todayHeaderRef.current;
    if (!board || !header) return;

    const target =
      header.offsetLeft -
      board.clientWidth / 2 +
      header.clientWidth / 2;

    board.scrollTo({
      left: Math.max(0, target),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (!currentMonth || loading) return;
    const timer = window.setTimeout(centerTodayColumn, 120);
    return () => window.clearTimeout(timer);
  }, [centerTodayColumn, currentMonth, loading, roomNames.length]);
'@

if ($calendar.Contains($effectAnchor) -and -not $calendar.Contains('const centerTodayColumn = useCallback')) {
    $calendar = $calendar.Replace($effectAnchor, $effectReplacement)
}

# Update goToday so pressing Today also centers the column.
$oldGoToday = 'function goToday() { activeViewRef.current = ""; setMonth(monthValue(today)); setWeekOffset(0); setSelectedCells([]); }'
$newGoToday = 'function goToday() { activeViewRef.current = ""; setMonth(monthValue(today)); setWeekOffset(0); setSelectedCells([]); window.setTimeout(centerTodayColumn, 160); }'
if ($calendar.Contains($oldGoToday)) {
    $calendar = $calendar.Replace($oldGoToday, $newGoToday)
}

# ----------------------------------------------------------
# Lock past dates in selection logic
# ----------------------------------------------------------

$oldSelectStart = 'function selectCalendarCell(room: string, date: string) {' + "`r`n" + '    if (!nativeMode || cellOccupied(room, date)) return;'
if (-not $calendar.Contains($oldSelectStart)) {
    $oldSelectStart = 'function selectCalendarCell(room: string, date: string) {' + "`n" + '    if (!nativeMode || cellOccupied(room, date)) return;'
}
$newSelectStart = 'function selectCalendarCell(room: string, date: string) {' + "`r`n" + '    if (date < todayKey) { setError("Past dates are locked. New bookings can start from today."); return; }' + "`r`n" + '    if (!nativeMode || cellOccupied(room, date)) return;'

if ($calendar.Contains($oldSelectStart) -and -not $calendar.Contains('Past dates are locked. New bookings can start from today.')) {
    $calendar = $calendar.Replace($oldSelectStart, $newSelectStart)
}

# Add board ref.
$calendar = $calendar.Replace(
    '<div className={`calendar-board ${loading ? "loading" : ""}`}>',
    '<div ref={boardRef} className={`calendar-board ${loading ? "loading" : ""}`}>'
)

# Add today header ref.
$oldHeader = 'return <div key={dateKey(date)} className={`calendar-day ${current ? "today" : ""} ${weekend ? "weekend" : ""}`} title={date.toLocaleDateString()}>'
$newHeader = 'return <div ref={current ? todayHeaderRef : undefined} key={dateKey(date)} className={`calendar-day ${current ? "today" : ""} ${weekend ? "weekend" : ""}`} title={date.toLocaleDateString()}>'
if ($calendar.Contains($oldHeader)) {
    $calendar = $calendar.Replace($oldHeader, $newHeader)
}

# Lock individual date cells and double-click.
$oldCell = 'return <button key={key} type="button" aria-label={`${roomName} ${key}`} onClick={() => selectCalendarCell(roomName, key)} onDoubleClick={() => { if (nativeMode && !cellOccupied(roomName, key)) { setDraft({ roomNames: [roomName], checkIn: key, checkOut: dateKey(addDays(localDate(key), 1)), action: "add" }); setEditing("new"); setSelectedCells([]); } }} className={`${key === dateKey(today) ? "today" : ""} ${selectedCell ? "selected" : ""} ${nativeMode && !cellOccupied(roomName, key) ? "selectable" : ""}`}/>;'
$newCell = 'const past = key < todayKey; return <button key={key} type="button" disabled={past} title={past ? "Past date locked" : `${roomName} ${key}`} aria-label={`${roomName} ${key}`} onClick={() => selectCalendarCell(roomName, key)} onDoubleClick={() => { if (!past && nativeMode && !cellOccupied(roomName, key)) { setDraft({ roomNames: [roomName], checkIn: key, checkOut: dateKey(addDays(localDate(key), 1)), action: "add" }); setEditing("new"); setSelectedCells([]); } }} className={`${key === todayKey ? "today" : ""} ${past ? "past-locked" : ""} ${selectedCell ? "selected" : ""} ${!past && nativeMode && !cellOccupied(roomName, key) ? "selectable" : ""}`}/>;'
if ($calendar.Contains($oldCell)) {
    $calendar = $calendar.Replace($oldCell, $newCell)
} elseif (-not $calendar.Contains('className={`${key === todayKey ? "today"')) {
    throw "Could not locate the current Calendar day-cell renderer."
}

# Set min dates for new bookings only.
$calendar = $calendar.Replace(
    '<label>Check-in<input name="check_in" type="date" defaultValue={editing === "new" ? draft?.checkIn || "" : editing.check_in} required/></label>',
    '<label>Check-in<input name="check_in" type="date" min={editing === "new" ? todayKey : undefined} defaultValue={editing === "new" ? draft?.checkIn || todayKey : editing.check_in} required/></label>'
)

$calendar = $calendar.Replace(
    '<label>Check-out<input name="check_out" type="date" defaultValue={editing === "new" ? draft?.checkOut || "" : editing.check_out} required/></label>',
    '<label>Check-out<input name="check_out" type="date" min={editing === "new" ? dateKey(addDays(today, 1)) : undefined} defaultValue={editing === "new" ? draft?.checkOut || dateKey(addDays(today, 1)) : editing.check_out} required/></label>'
)

# ----------------------------------------------------------
# SERVER API — reject past check-ins
# ----------------------------------------------------------

$apiTypeAnchor = 'type Existing = {'
$apiHelper = @'
function todayInSriLanka() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

'@

if ($api.Contains($apiTypeAnchor) -and -not $api.Contains('function todayInSriLanka()')) {
    $api = $api.Replace($apiTypeAnchor, $apiHelper + $apiTypeAnchor)
}

# POST validation
$postAnchor = 'const isBlock = input.action === "block";'
$postReplacement = @'
const isBlock = input.action === "block";
    const today = todayInSriLanka();

    if (checkIn < today) {
      return NextResponse.json(
        { error: "Past dates are locked. New bookings can start from today." },
        { status: 400 },
      );
    }
'@
if ($api.Contains($postAnchor) -and -not $api.Contains('const today = todayInSriLanka();')) {
    $api = $api.Replace($postAnchor, $postReplacement)
}

# PATCH validation before edit processing. It should not affect cancel/move actions.
$patchAnchor = 'const names = requestedRoomNames(input);' + "`r`n" + '    const checkIn = String(input.check_in || "");' + "`r`n" + '    const checkOut = String(input.check_out || "");'
if (-not $api.Contains($patchAnchor)) {
    $patchAnchor = 'const names = requestedRoomNames(input);' + "`n" + '    const checkIn = String(input.check_in || "");' + "`n" + '    const checkOut = String(input.check_out || "");'
}
$patchReplacement = @'
const names = requestedRoomNames(input);
    const checkIn = String(input.check_in || "");
    const checkOut = String(input.check_out || "");

    if (checkIn < todayInSriLanka()) {
      return NextResponse.json(
        { error: "Past dates are locked. A booking cannot be moved into the past." },
        { status: 400 },
      );
    }
'@
if ($api.Contains($patchAnchor) -and -not $api.Contains('A booking cannot be moved into the past.')) {
    $api = $api.Replace($patchAnchor, $patchReplacement)
}

Set-Content -LiteralPath $calendarPath -Value $calendar -Encoding UTF8
Set-Content -LiteralPath $bookingApiPath -Value $api -Encoding UTF8

# ----------------------------------------------------------
# Append CSS to the Calendar stylesheet
# ----------------------------------------------------------

$cssFile = Get-ChildItem -Path (Join-Path $projectRoot "app") -Recurse -File -Filter "*.css" |
    Where-Object {
        (Get-Content -LiteralPath $_.FullName -Raw) -match '\.calendar-room-days'
    } |
    Select-Object -First 1

if (-not $cssFile) {
    throw "Could not locate the Calendar stylesheet."
}

$css = Get-Content -LiteralPath $cssFile.FullName -Raw
if ($css -notmatch 'NK HOTEL OS PAST DATE LOCK') {
$lockCss = @'

/* NK HOTEL OS PAST DATE LOCK */
.calendar-board{
  scroll-behavior:smooth;
}
.calendar-room-days>button.past-locked{
  cursor:not-allowed!important;
  background:
    repeating-linear-gradient(
      135deg,
      rgba(101,116,126,.055) 0,
      rgba(101,116,126,.055) 5px,
      rgba(101,116,126,.095) 5px,
      rgba(101,116,126,.095) 10px
    )!important;
  opacity:.64;
}
.calendar-room-days>button.past-locked:hover{
  background:
    repeating-linear-gradient(
      135deg,
      rgba(101,116,126,.055) 0,
      rgba(101,116,126,.055) 5px,
      rgba(101,116,126,.095) 5px,
      rgba(101,116,126,.095) 10px
    )!important;
}
.calendar-day.today{
  position:relative;
  z-index:2;
}
.calendar-day.today::after{
  content:"TODAY";
  position:absolute;
  left:50%;
  bottom:3px;
  transform:translateX(-50%);
  padding:2px 5px;
  border-radius:5px;
  background:#159777;
  color:#fff;
  font-size:7px;
  font-weight:900;
  letter-spacing:.06em;
}
'@
    Add-Content -LiteralPath $cssFile.FullName -Value $lockCss
}

Write-Host ""
Write-Host "Past-date lock and Today centering installed." -ForegroundColor Green
Write-Host "Calendar CSS updated: $($cssFile.FullName)" -ForegroundColor Cyan
Write-Host ""

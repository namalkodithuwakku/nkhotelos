# N K Hotel OS — Core Operations Update

This is an actual project update package.

## 1. Copy the project files

Extract the ZIP into:

`E:\NK Labs\NK Hotel OS`

Choose **Replace files in the destination**.

## 2. Run the SQL migration

Open Supabase:

`SQL Editor → New query`

Paste and run:

`supabase/migrations/03_NK_Hotel_OS_Core_Operations.sql`

Expected final result:

- `settings_rows = 1`
- existing room count remains available
- room types remain available

## 3. Update navigation and build

```powershell
Set-Location "E:\NK Labs\NK Hotel OS"

.\apply-core-navigation.ps1

npm run build
```

## 4. Test locally

```powershell
npm run dev
```

Test:

- `/rooms`
- `/actions`
- `/notifications`
- `/settings`
- `/staff`

## 5. Push

```powershell
git add .
git commit -m "Add Hotel OS core operations"
git push origin main
```

## What is genuinely working

- Room type creation
- Room creation
- Room operational status
- Housekeeping status
- Central actions CRUD workflow
- Notification read/dismiss workflow
- Property settings
- Staff user creation for Master
- Staff role and active-status management

Calendar, Occupancy, Revenue, Marketing, Reputation and QR Menu are separate
implementation stages and are not falsely marked complete by this package.

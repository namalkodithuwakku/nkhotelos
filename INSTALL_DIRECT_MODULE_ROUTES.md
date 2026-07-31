# Connect OS modules directly

Extract this ZIP into:

`E:\NK Labs\NK Hotel OS`

Choose **Replace files in the destination**.

Then run in PowerShell:

```powershell
Set-Location "E:\NK Labs\NK Hotel OS"

.\apply-os-links.ps1

npm run build
```

Test locally:

```powershell
npm run dev
```

Open these pages after signing in through `/`:

```text
http://localhost:3000/calendar
http://localhost:3000/occupancy
http://localhost:3000/revenue-manager
```

They use the existing Supabase OS session. They do not show the old NKH Dashboard
username/PIN login.

Push everything:

```powershell
git add .
git commit -m "Connect OS modules to Supabase login"
git push origin main
```

The old `/legacy-dashboard` route remains only as a temporary internal backup.
It is no longer linked from the OS home.

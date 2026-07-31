# N K Hotel OS — All Pages Setup

Extract this ZIP into:

`E:\NK Labs\NK Hotel OS`

Choose **Replace files in the destination**.

This update directly replaces `app/page.tsx`; no link-update script is needed.

Routes created:

- `/calendar`
- `/occupancy`
- `/revenue-manager`
- `/marketing-manager`
- `/reputation-manager`
- `/actions`
- `/qr-menu`
- `/reports`
- `/staff`
- `/notifications`
- `/settings`

Existing routes preserved:

- `/property`
- `/tools`
- `/legacy-dashboard` — not linked anywhere in the OS

## Build and push

```powershell
Set-Location "E:\NK Labs\NK Hotel OS"

npm run build

git add .
git commit -m "Set up complete Hotel OS page structure"
git push origin main
```

After Vercel shows Ready, use `Ctrl + Shift + R`.

Important: Calendar, Occupancy and Revenue Manager now open their existing
workspace components directly under the Supabase-protected OS shell. Their
older API endpoints may still require migration from Staff Dashboard data to
the new `os_` tables; this route update removes the legacy login but does not
silently claim that data migration is already complete.

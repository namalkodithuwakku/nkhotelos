# N K Hotel OS environment runtime fix

Copy the included `app` folder into:

`E:\NK Labs\NK Hotel OS`

Choose **Replace files in the destination**.

Then run:

```powershell
Set-Location "E:\NK Labs\NK Hotel OS"
npm run build
git add app/lib/supabase/env.ts
git commit -m "Fix Supabase public environment variables"
git push origin main
```

This changes dynamic `process.env[name]` access to direct `NEXT_PUBLIC_...`
references so Next.js can include the values in the production browser bundle.

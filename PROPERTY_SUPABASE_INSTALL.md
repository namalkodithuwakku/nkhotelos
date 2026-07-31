# Property page — Supabase live connection

Copy the included `app/property` folder into:

`E:\NK Labs\NK Hotel OS\app\property`

Allow Windows to replace `page.tsx`.

## Test locally

```powershell
Set-Location "E:\NK Labs\NK Hotel OS"
npm run build
npm run dev
```

Open:

`http://localhost:3000/property`

Sign in with the password for the Supabase Authentication user:

`nkhotelsup@gmail.com`

The account must match user ID:

`83ae5fd8-384b-4851-8ab9-09f220d90558`

The page reads and updates `public.os_properties` under Supabase RLS.

## Push after testing

```powershell
git add .
git commit -m "Connect Property page to Supabase"
git push origin main
```

No service-role key is sent to the browser. Property updates use the signed-in
Supabase user and the existing row-level security policies.

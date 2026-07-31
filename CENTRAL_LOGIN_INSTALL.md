# Central Supabase Login

Copy this package into `E:\NK Labs\NK Hotel OS` and replace included files.

In Supabase: Authentication > URL Configuration

Set Site URL to your live Vercel URL and add redirect URLs:
- http://localhost:3000/auth/update-password
- https://YOUR-VERCEL-DOMAIN/auth/update-password

Test:
```powershell
Set-Location "E:\NK Labs\NK Hotel OS"
npm run build
npm run dev
```

Push:
```powershell
git add .
git commit -m "Connect central OS login to Supabase"
git push origin main
```

Copy the included app folder into E:\NK Labs\NK Hotel OS and replace files.

Then run:
Set-Location "E:\NK Labs\NK Hotel OS"
npm run build
npm run dev

After testing:
git add app/page.tsx app/page.module.css app/globals.css
git commit -m "Simplify Hotel OS dashboard UI"
git push origin main

N K HOTEL OS UPDATE PACKAGE

PURPOSE
- Keeps existing completed Dashboard, Calendar, Occupancy, Revenue and Tools files untouched.
- Replaces old NKH Staff Dashboard product identity.
- Adds planned OS pages: Marketing, Reputation, Actions, QR Menu, Reports, Property, Staff, Notifications and Settings.

INSTALL
1. Make a backup or commit your current nkhotelos folder.
2. Copy all files/folders from this package into E:\NK Labs\NK Hotel OS.
3. Allow Windows to merge folders and replace package.json and app/layout.tsx.
4. Check your existing manifest filename. This package uses public/manifest.webmanifest.
5. Use OS_NAVIGATION_PLAN.ts to update your existing sidebar/navigation component. It is intentionally not auto-replaced because the exact sidebar path was not available in the package-building environment.
6. Run:
   npm install
   npm run build
7. Fix only route conflicts if your existing project already has a page with the same planned route.
8. Commit and push:
   git add .
   git commit -m "Arrange N K Hotel OS and add planned modules"
   git push origin main

IMPORTANT
- Do not delete completed feature folders.
- Do not add Google Sheets as a live data source.
- Supabase remains the source of truth.
- Google Sheets should be added later as a scheduled backup integration only.

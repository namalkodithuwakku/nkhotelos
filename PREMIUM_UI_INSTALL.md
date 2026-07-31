# N K Hotel OS — Premium UI Upgrade

This package upgrades the visual design only. It does not change Supabase data,
routes or working business logic.

## Install

Extract into:

`E:\NK Labs\NK Hotel OS`

Choose **Replace files in the destination**.

## Build and push

```powershell
Set-Location "E:\NK Labs\NK Hotel OS"

npm run build

git add app/page.module.css app/components/os/OSPageShell.module.css app/components/os/CoreUI.module.css
git commit -m "Upgrade Hotel OS to premium dashboard UI"
git push origin main
```

After Vercel is Ready, use:

`Ctrl + Shift + R`

## Design direction

- Premium white and charcoal foundation
- Rich orange primary action
- Sage, cyan, lavender, rose and muted gold accents
- Softer cards and depth
- Clearer typography
- Stronger mobile polish
- No dark overall theme
- No white text on white backgrounds

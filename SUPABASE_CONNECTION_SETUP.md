# N K Hotel OS — Supabase Connection Setup

Copy the included `app` and `scripts` folders into:

`E:\NK Labs\NK Hotel OS`

## 1. Install required packages

```bat
cd /d "E:\NK Labs\NK Hotel OS"
npm install @supabase/supabase-js @supabase/ssr dotenv server-only
```

## 2. Confirm `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxxxxxxxx
```

The code also accepts the older names:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
```

Never commit `.env.local`.

## 3. Test Supabase

```bat
node scripts/test-supabase.mjs
```

Expected result:

```text
Supabase connection successful
NKH001 | Queens Beach Hotel | 13 | LKR | Asia/Colombo | active
```

## 4. Build the project

```bat
npm run build
```

## 5. Push after successful testing

```bat
git add .
git commit -m "Connect N K Hotel OS to Supabase"
git push origin main
```

The `admin.ts` client must never be imported into a client component.

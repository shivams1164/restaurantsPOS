# Restaurant POS & Management System

Monorepo containing:
- `web/` Next.js 14 owner dashboard
- `mobile/` Expo SDK 51 app for waiter + delivery roles
- `supabase/` SQL schema, seed, and edge function

## 1) Prerequisites

- Node.js 20+
- pnpm 9+
- npm 10+
- Supabase CLI
- Expo CLI (installed via `npx`)

## 2) Supabase Setup

1. Create a new Supabase project.
2. In Supabase dashboard, copy:
   - Project URL
   - Anon key
   - Service role key
3. Ensure Email auth provider is enabled.
4. Create storage bucket named `restaurant-assets` and make it public.

## 3) Apply Database Migration and Seed

From repository root:

```bash
cd supabase
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase db seed
```

This applies `migrations/001_schema.sql` and runs `seed.sql`, creating:
- Default owner user: `admin@restaurant.com` / `admin123`
- Default owner profile
- Demo restaurant + menu items (idempotent)

## 4) Deploy Edge Function

```bash
cd supabase
supabase functions deploy create-staff-user --no-verify-jwt=false
```

Set function secrets:

```bash
supabase secrets set \
  SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY \
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

## 5) Configure Web Environment

```bash
cd web
cp .env.example .env.local
```

Update `.env.local` values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=restaurant-assets`

## 6) Configure Mobile Environment

```bash
cd mobile
cp .env.example .env
```

Update values:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_OWNER_DASHBOARD_URL`

## 7) Install Dependencies

Web (pnpm):

```bash
cd web
pnpm install
```

Mobile (npm):

```bash
cd mobile
npm install
```

## 8) Run Locally

Web:

```bash
cd web
pnpm dev
```

Mobile:

```bash
cd mobile
npx expo start
```

Login behavior:
- Owner role opens web dashboard (`/dashboard`)
- Waiter role enters waiter stack
- Delivery role enters delivery stack

## 9) Vercel Deployment (Web)

1. Create a Vercel project and point it to `restaurant-pos/web`.
2. Set build command: `pnpm build`.
3. Set install command: `pnpm install`.
4. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`
5. Deploy.

## 10) Supabase Realtime Setup

`orders` realtime publication is enabled in migration:

```sql
alter publication supabase_realtime add table public.orders;
```

In Supabase dashboard:
1. Go to Database > Replication.
2. Confirm `public.orders` is included in `supabase_realtime` publication.
3. Ensure clients connect with authenticated users.

Web and mobile subscribe using `postgres_changes` on `public.orders` filtered by `restaurant_id`.

## 11) Generate Fresh TypeScript Types (Optional)

If your schema changes:

```bash
# from repository root
npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > web/types/database.ts
npx supabase gen types typescript --project-id YOUR_PROJECT_REF --schema public > mobile/types/database.ts
```

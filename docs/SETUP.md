# Setup

## Prerequisites

- Node 22 and pnpm 9 (`corepack enable` is enough).
- Docker Desktop, for the local Supabase stack. A hosted Supabase project works identically.

## 1. Install

```bash
pnpm install
cp .env.example .env.local
```

## 2. Database (local)

```bash
pnpm db:start      # starts Postgres, Auth, Storage, PostgREST and Mailpit in Docker
pnpm db:reset      # applies supabase/migrations/* and supabase/seed.sql
pnpm db:types      # regenerates types/database.ts after schema changes
```

`pnpm db:start` prints the local URL, anon key and service-role key. Put them in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
```

Local auth has email confirmations disabled (`supabase/config.toml`) so sign-up logs you in immediately. Mailpit at http://127.0.0.1:54324 shows password-reset emails.

### Hosted Supabase

1. Create a project. Copy the project URL, anon key and service-role key into Vercel environment variables (never commit the service-role key).
2. Link and push migrations: `pnpm exec supabase link --project-ref <ref>` then `pnpm exec supabase db push`.
3. In Authentication → URL configuration set the site URL to your production domain and add `https://<domain>/auth/callback` to redirect URLs.
4. The `invitation-media` bucket is created by the first migration (private, 8 MB, images only).

5. In Authentication → Sign In / Providers, turn on **Allow anonymous sign-ins** (guests design before creating an account). Consider enabling CAPTCHA (Authentication → Attack Protection) to stop abuse.
6. Schedule guest cleanup, for example daily with pg_cron: `select cron.schedule('purge-guests', '0 3 * * *', $$select public.purge_stale_guests()$$);`. It removes guest users inactive for 30 days, along with their drafts.

### Google sign-in

1. In Google Cloud Console, create an OAuth client (type: Web application). Add these authorised redirect URIs:
   - `https://<project-ref>.supabase.co/auth/v1/callback` (hosted)
   - `http://127.0.0.1:54321/auth/v1/callback` (local)
2. **Hosted:** in Supabase, go to Authentication → Sign In / Providers → Google. Enable it, then paste the client ID and secret.
3. **Local:** export `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`, set `enabled = true` under `[auth.external.google]` in `supabase/config.toml`, then restart with `pnpm db:stop && pnpm db:start`.
4. Set `NEXT_PUBLIC_AUTH_GOOGLE=true` (in `.env.local` and on Vercel) to show the "Continue with Google" buttons.

Google sign-in also works for guests: the auth callback moves their drafts to the account they sign in with.

### Making someone an admin

```sql
update public.profiles set role = 'admin' where id = '<auth user id>';
```

Only database administrators or existing admins can change `role` or `plan` (enforced by a trigger).

## 3. Run

```bash
pnpm dev           # http://localhost:3100
```

## 4. Quality checks

```bash
pnpm lint
pnpm typecheck     # runs next typegen first so PageProps/RouteContext helpers exist
pnpm test          # unit + component tests (Vitest, jsdom)
pnpm test:rls      # RLS/tenant-isolation tests against the local Supabase stack
pnpm test:e2e      # Playwright; builds and starts the app on :3100, needs the local stack
pnpm build
```

`pnpm check` runs lint, typecheck, unit tests and build in sequence.

## 5. Deploy (Vercel)

- Framework preset: Next.js. Build command `pnpm build`.
- Environment variables (Production and Preview): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `RSVP_IP_SALT`.
- `vercel.json` schedules `/api/cron/cleanup-media` daily. Vercel sends `Authorization: Bearer $CRON_SECRET` automatically when `CRON_SECRET` is set.
- Use a separate Supabase project for Preview if previews must not touch production data.

## 6. Schema changes

1. `pnpm exec supabase migration new <name>` creates `supabase/migrations/<timestamp>_<name>.sql`.
2. Write SQL, then `pnpm db:reset` and `pnpm db:types`.
3. Add or update RLS policies in the same migration and extend `tests/rls`.
4. Document the change in `docs/ARCHITECTURE.md` if it affects the model.

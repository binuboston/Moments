# Mirth — digital event invitations

Choose a design. Make it yours. Share your event with the world.

Mirth is a multi-tenant SaaS for elegant digital invitations: weddings, engagements, birthdays, anniversaries, baby showers, housewarmings, parties and corporate events. Users pick a template, enter event details, personalise colours and typography, publish to a unique URL and share it on WhatsApp.

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix UI, TanStack Query/Table, Zustand, React Hook Form, Zod, GSAP, Supabase (Auth, Postgres with RLS, Storage).
- **Docs:** [Architecture](docs/ARCHITECTURE.md) · [Setup](docs/SETUP.md)

## Quick start

```bash
pnpm install
cp .env.example .env.local   # fill in keys printed by pnpm db:start
pnpm db:start && pnpm db:reset
pnpm dev                     # http://localhost:3100
```

## Project map

| Path | Purpose |
| --- | --- |
| `app/` | Routes: marketing, auth, dashboard, admin, public `/e/[slug]`, API route handlers |
| `components/ui`, `components/layout`, `components/forms` | Design system primitives, shells, form helpers |
| `features/templates` | Template registry, renderer, section components, six template designs |
| `features/invitations` | Editor, dashboard components, API client, server queries |
| `features/rsvp`, `features/media`, `features/auth`, `features/admin` | Feature slices |
| `lib/supabase`, `lib/validation`, `lib/utils`, `lib/entitlements.ts` | Clients, Zod schemas, pure helpers, plan rules |
| `supabase/migrations` | Versioned schema, RLS, storage policies, catalogue data |
| `tests/unit`, `tests/component`, `tests/rls`, `tests/e2e` | Vitest, Testing Library, RLS isolation, Playwright |

## Scripts

`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm test:rls` · `pnpm test:e2e` · `pnpm db:start` · `pnpm db:reset` · `pnpm db:types`

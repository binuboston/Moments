# Architecture Plan

Digital event invitation SaaS. Users pick a template, enter event details, personalise, publish to a unique URL and share it. This document records the decisions the codebase is built on. Update it when a decision changes.

## 1. Repository inspection (Stage 1 findings)

- The repository was empty at the start of this work. There was no prior application, schema or design to preserve.
- Toolchain available on the development machine: Node 22, pnpm 9, Docker Desktop, no Supabase CLI (added as a dev dependency).
- The project was scaffolded with `create-next-app@16.4.2` and then adjusted. Notable adjustments:
  - `cacheComponents` was disabled. The default scaffold enables it, which forbids `revalidate`/`dynamic` segment config and requires Suspense around every request-time read. For an authentication-heavy dashboard the previous caching model is simpler and well understood. Public invitation pages use time-based revalidation plus `revalidatePath` on publish.
  - TypeScript pinned to 5.x (7.x is a new compiler without the JS API used by tooling), Vitest 4, ESLint 9, TanStack Table 8. All other packages are current stable majors and their peer ranges were checked before installation.

## 2. Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript strict |
| Styling | Tailwind CSS v4 with tokens defined in `app/globals.css` via `@theme` |
| Primitives | `radix-ui` (single package), `lucide-react` icons |
| Server state | TanStack Query v5, hydrated from Server Components where lists are shown |
| Client state | Zustand for the invitation editor only |
| Forms / validation | React Hook Form + Zod v4; Zod schemas are the single source of truth for content shapes |
| Backend | Supabase Auth, Postgres with RLS, Storage; Next.js Route Handlers for mutations |
| Motion | GSAP + `@gsap/react` (marketing hero, template reveal), Lenis (single global instance on marketing routes), `motion` only for micro-interactions |
| Tests | Vitest + Testing Library (unit/component), Playwright (end-to-end), SQL + supabase-js scripts for RLS |
| Deploy | Vercel (app), Supabase (auth, database, storage) |

## 3. Directory layout

```
app/                     routes only; thin, delegate to features
  (marketing)/           /, /templates, /templates/[slug], /pricing, /how-it-works, /help
  (auth)/                /login, /signup, /forgot-password, /reset-password
  auth/callback/         code exchange route handler
  (dashboard)/dashboard  overview, invitations, new, [id]/edit, settings
  (admin)/admin          overview, templates, events, categories (server-side role check in layout)
  e/[slug]/              public invitation + opengraph-image
  api/                   route handlers: invitations, media, rsvp, admin
  sitemap.ts, robots.ts
components/ui            design system primitives (Button, Input, Dialog, ...)
components/layout        Container, SiteHeader, SiteFooter, DashboardShell
components/forms         Field, FormMessage, ImageUploader
features/templates       registry, definitions, renderer, sections, themes
features/invitations     editor store, wizard steps, API client, mappers, slug logic
features/rsvp            RSVP form, owner RSVP table, export
features/media           upload client, signed URL helpers
lib/supabase             browser/server/admin clients, proxy helper
lib/validation           shared Zod schemas (content, theme, rsvp, env)
lib/utils                cn, dates, slugs, share links, ics
stores/                  Zustand stores
types/                   generated database types + domain types
supabase/migrations      versioned SQL
supabase/tests           RLS test SQL
tests/                   unit, component, e2e, rls
docs/                    this file, SETUP.md
```

## 4. Domain model

```
profiles            1 per auth user. role: user | admin. plan: free | pro (entitlement hook, unused for billing in v1)
event_categories    slug, name, description, icon, sort_order, is_active
templates           slug, renderer_key (must exist in code registry), name, description, tier, status, is_featured, category_slugs[], sort_order
invitations         owner_id, template_id, category_id, slug (unique), title, status (draft|published|unpublished), content jsonb, theme jsonb, settings jsonb, published_at, timestamps
invitation_functions invitation_id, name, starts_at, ends_at, timezone, venue_name, address, maps_url, description, sort_order
invitation_media    invitation_id, owner_id, storage_path, kind (cover|gallery), width, height, size_bytes, mime_type, sort_order, alt
rsvps               invitation_id, guest_name, attendance (yes|no|maybe), guest_count, message, dietary_notes, contact, submission_key (unique), ip_hash, created_at
```

Rules:

- Ownership, status, slugs and relationships are relational columns. Only template-specific content (`content`), theme choices (`theme`) and feature toggles (`settings`) are JSONB, and each is validated by a Zod schema on every write.
- Template rendering components live in code. The `templates` table holds availability, tier and ordering so admins can manage the catalogue without a deploy. A registry test asserts that every seeded `renderer_key` exists in the code registry.
- `event_categories` drive both the wizard and the content schema. Each category maps to a Zod content schema (`lib/validation/content.ts`) so a birthday does not carry wedding fields.

## 5. Security model

- Supabase Auth with cookie sessions via `@supabase/ssr`. `proxy.ts` refreshes the session and redirects unauthenticated users away from `/dashboard` and `/admin`. Redirects in proxy are a convenience; every page and route handler re-checks the user on the server.
- RLS is enabled on every table. Owners can read/write their own invitations, functions, media and read/delete their own RSVPs. Anonymous visitors can read only `status = 'published'` invitations and their functions/media. Admin access is granted through `public.is_admin()` (reads `profiles.role`). Category and template reads are public; writes require admin.
- RSVP inserts never hit the table directly. A `SECURITY DEFINER` function `submit_rsvp` verifies the invitation is published with RSVP enabled, rate-limits by hashed IP, de-duplicates by a submission key and inserts. The route handler validates the payload with Zod before calling it.
- The service-role key is only used in `lib/supabase/admin.ts`, which imports `server-only`, and is currently needed only for test seeding and cleanup jobs.
- Storage bucket `invitation-media` is private. Paths are `{invitation_id}/{uuid}.{ext}`. Storage policies allow owners to manage objects under invitations they own, and allow anyone to read objects under published invitations. Public pages and the editor use signed URLs generated server-side, so draft media is never publicly addressable.
- Slugs are generated server-side from the headline plus a random suffix, validated against a reserved list and a strict pattern, and protected by a unique index. Users may customise the slug; availability is checked server-side.
- Client-supplied `owner_id` is never trusted. Route handlers derive the user from the session and RLS enforces it again.

## 6. Rendering engine

- `features/templates/registry.ts` maps `renderer_key -> TemplateDefinition`. A definition declares metadata, supported categories, supported and default sections, allowed palettes and font pairings, and the React component that renders it.
- `InvitationRenderer` receives a validated `InvitationView` (content, functions, media with signed URLs, resolved theme, settings) and a `mode` (`public` or `preview`). The editor preview and the public page both call this component, so there is one rendering path.
- Templates are Server-Component friendly. Interactive islands (countdown, gallery lightbox, RSVP form, add-to-calendar) are small Client Components reused across templates.
- Theme customisation is bounded: templates expose named palettes and font pairings. Theme CSS variables are applied on the template root, so templates style with tokens, not hardcoded colours.
- Fonts are loaded with `next/font/google` once in the root layout and exposed as CSS variables. Templates reference the variables.
- User content is rendered as text. No HTML or scripts from users are ever interpreted.

## 7. Data flow and state

- Server Components fetch initial data with the server Supabase client. Dashboard lists hydrate TanStack Query through `HydrationBoundary`; mutations call route handlers and invalidate queries.
- The editor uses a Zustand store (`stores/editor-store.ts`) holding the draft, dirty flag and step. Autosave debounces changes into `PATCH /api/invitations/[id]`. The store is reset on unmount.
- Public page: `app/e/[slug]/page.tsx` with `revalidate = 300`. Publish, unpublish and edits call `revalidatePath('/e/<slug>')`.

## 8. Media

- Uploads go browser -> Supabase Storage directly with the user's session (RLS enforced). Before upload, the route handler `POST /api/media` validates type/size, creates the `invitation_media` row and returns the exact storage path to upload to. After upload the client confirms with `PATCH`. Orphans (rows without a confirmed upload) are cleaned by a periodic job (`/api/cron/cleanup-media`, protected by `CRON_SECRET`).
- Dimensions are read client-side before upload for layout stability; the server stores them.
- Images render through `next/image` with `remotePatterns` for the Supabase host.

## 9. Monetisation hooks (not billing)

- `profiles.plan` and `templates.tier` exist from day one. `lib/entitlements.ts` is the only place that answers "can this user use this template / remove branding". Presentation components ask it; they never inspect plan strings themselves.
- Free invitations show a small platform badge. No payment provider is integrated in v1.

## 10. Testing strategy

- Vitest: slug generation and validation, Zod content schemas per category, theme resolution, registry integrity, share and calendar link builders.
- Testing Library: RSVP form validation states, wizard step navigation.
- Playwright: marketing smoke, signup/login, create -> save draft -> resume -> publish -> public render -> unpublish -> 404, RSVP submission, owner isolation (user B cannot open user A's edit page), unknown slug, mobile viewport.
- RLS: `tests/rls/*.test.ts` runs against the local Supabase stack with two real users and the anon key, asserting that cross-tenant reads/writes fail and public reads expose only published rows.

## 10a. Decisions recorded during implementation

- **No `loading.tsx` on `/e/[slug]` or the marketing group.** A loading boundary streams a 200 shell before `notFound()` runs, so unknown invitation slugs would return 200. Public pages must return real 404s for link checkers and messaging apps. Dashboard and admin routes keep skeletons because status codes do not matter there; their security assertions are the API responses and RLS.
- **Decorative previews are `inert` and `aria-hidden`.** Catalogue cards, the hero and the auth page render full invitations (headings, RSVP forms). Without `inert` those would leak into the host page's accessibility tree and tab order. The editor preview is the exception and is exposed as a labelled region.
- **Branding flag lives in `settings.branding`** and is rewritten from the owner's plan on every settings write and on publish. The anonymous public read cannot see the owner's plan, so the decision is stored with the invitation.
- **Local port is 3100.** Port 3000 was occupied on the development machine; every local URL (site URL, Supabase redirect URLs, Playwright base URL) uses 3100.
- **Category content kinds are code.** Admins can manage names, descriptions, icons, ordering and availability of categories, but a new kind of event needs a Zod schema and wizard fields first. The admin UI only offers slugs that have a schema.

## 10b. Cinematic template engine (added 2026-10-21)

Premium templates are art-direction configs over a shared engine in `features/templates/cinematic/`; see [TEMPLATES.md](TEMPLATES.md). Key decisions:

- Templates are configuration, validated with Zod at module load: palettes, fonts, opening style, layout variants and section order. Adding a design is mostly a config file.
- One owner per animated property: GSAP for the opening timeline and parallax, IntersectionObserver plus CSS for reveals and the hero entrance, CSS keyframes for ambient effects. Content is visible without JavaScript.
- Container queries instead of viewport breakpoints, so scaled previews match real phones.
- New render mode `demo` for `/demo/[slug]` live demos. These are full page but never submit data.
- Accessible gold: separate `accent` (decorative) and `accentInk` (text, at least 4.5:1) roles, enforced by tests.
- Catalogue cache keys include the registry's template keys, so a deploy that adds renderers busts the cached catalogue.
- Sample photography is licensed from Wikimedia Commons (Unsplash's API now requires a key) and limited to face-free detail shots.

## 11. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Next 16 API drift (async params, proxy rename, revalidateTag signature) | Follow bundled docs in `node_modules/next/dist/docs`; `next typegen` before `tsc` |
| RLS gaps leaking drafts or guest data | Dedicated RLS test suite; public reads go through explicit column lists |
| Template sprawl breaking layout | Bounded theme options; registry test; shared section components |
| Signed URL expiry vs. page cache | Signed URLs live 7 days, page revalidates every 5 minutes |
| Abuse of public RSVP endpoint | DB-side rate limit per hashed IP per invitation, dedupe key, payload size limits |
| Local dev needs Docker | `pnpm db:start` excludes heavy services; hosted Supabase works identically |

## 12. Milestones

1. Foundation: tokens, UI primitives, layouts, marketing pages. Verify: lint, typecheck, build.
2. Data: migrations, RLS, auth flows, proxy. Verify: RLS tests against local stack.
3. Engine: registry, three templates, renderer, sample data, catalogue previews.
4. Creation: wizard, drafts, autosave, publish, slugs, public page.
5. Dashboard and media.
6. Sharing, Open Graph, RSVP.
7. Hardening: tests, accessibility, performance, docs.

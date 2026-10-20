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
| Motion | GSAP 3 (ScrollTrigger, SplitText, Flip) + `@gsap/react`, Lenis on marketing routes only. One motion library; see section 10c |
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
components/motion        SmoothScroll, RevealController, HeroEntrance, NavigationProgress, SwapTransition, useFlipList, LazyMount
components/layout        Container, SiteHeader, SiteFooter, DashboardShell
components/forms         Field, FormMessage, ImageUploader
features/templates       registry, definitions, renderer, sections, themes
features/invitations     editor store, wizard steps, API client, mappers, slug logic
features/rsvp            RSVP form, owner RSVP table, export
features/media           upload client, signed URL helpers
lib/supabase             browser/server/admin clients, proxy helper
lib/validation           shared Zod schemas (content, theme, rsvp, env)
lib/motion               GSAP registration, motion tokens, pre-paint script
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

## 10b. Template system (2026-10-21)

The cinematic template engine added earlier was removed for consistency; all designs are classic template components. See [TEMPLATES.md](TEMPLATES.md). The `demo` render mode and `/demo/[slug]` live demos remain and work for every template.

## 10c. Motion system (2026-10-20)

GSAP is the only animation library. Everything lives in two places:

- `lib/motion/gsap.ts` registers plugins once and exports `gsap`, `ScrollTrigger`, `SplitText`, `useGSAP`, `prefersReducedMotion` and `MQ` (media queries for `gsap.matchMedia`). Import GSAP from here, never from `gsap` directly. `Flip` is registered in `components/motion/use-flip-list.ts` so it only ships with the dashboard.
- `lib/motion/tokens.ts` holds `DURATION`, `EASE`, `STAGGER` and `RISE`. CSS has matching tokens in `app/globals.css` (`--ease-out-quart`, `--duration-fast|base|slow`) for transitions and Radix enter/exit keyframes.

**Declarative reveals.** Pages do not write GSAP code for entrances. They mark elements and `RevealController` binds them (scoped, re-run per pathname, reverted on unmount):

| Attribute | Effect |
| --- | --- |
| `data-reveal` | Rise and fade when scrolled into view (batched, once) |
| `data-reveal="split"` | SplitText line reveal for headings |
| `data-reveal="mask"` | Clip-path reveal of the first child (images, devices) |
| `data-scrub-words` | Word opacity scrubbed with scroll (statement copy) |
| `data-speed="0.2"` | Parallax drift, desktop and motion-OK only |
| `data-hero` | Played by `HeroEntrance` on load instead of on scroll |

**No-flash and failsafe rules.** `lib/motion/pre-paint.ts` runs in `<head>` and adds `motion-ok` to `<html>` unless the visitor prefers reduced motion. Only under `.motion-ok` are `[data-reveal]`/`[data-hero]` hidden before paint. JS marks elements it has taken over with `data-reveal-bound`; any element still unbound after 2.5s is shown by a CSS animation, so a script failure can never leave content invisible. Reduced motion skips Lenis, parallax and pins and shows content immediately.

**Invitations.** The public page and live demo have their own motion layer: an opening card, Lenis, `data-inv-*` reveals and a quick-action dock. See [TEMPLATES.md](TEMPLATES.md#guest-experience-and-motion). Its reveals use opacity only, so unrevealed RSVP fields stay focusable.

**Lenis.** `SmoothScroll` (marketing layout, public invitations and live demos) drives Lenis from the GSAP ticker and feeds `ScrollTrigger.update`, refreshing after fonts load. Use `useLenis()` for programmatic scrolling. Dashboard and editor use native scroll (nested scroll containers and forms behave better).

**Pins.** `PinnedShowcase` and `HorizontalScroller` pin on desktop only and fall back to native swipe rows on phones. Pins add spacer height after the first refresh, so triggers that depend on layout below them use `refreshPriority: -1`. Never put a `position: fixed` element inside a transformed (animated) ancestor.

**App motion.** `NavigationProgress` (top bar on route changes), `SwapTransition` (editor panels and wizard steps), `useFlipList` (invitation grid reorder, enter and delete), and optimistic TanStack Query mutations with rollback in `features/invitations/hooks.ts`.

**App design system.** Canvas, borderless surfaces, elevation, tones and the card anatomy are specified in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

**Brand layer (`components/brand/`).** The motifs guests see in invitations are shared with the app so the product feels like one brand:

- `blossom.tsx`: the six-petal `Blossom`, the `CornerBloom` spray (any colours) and `blossomMarkup()` for imperatively created particles.
- `burst.ts`: one particle burst (blossoms, blossoms and stars, or confetti) used by the invitation opening card and by the app.
- `celebrate.tsx`: `CelebrationProvider` (in the dashboard shell) and `useCelebrate()`, which fires brand-coloured bursts from an element (choosing an occasion in the wizard, going live for the first time). It does nothing under reduced motion.
- The `font-serif` token (Fraunces, shared with the templates) is for emphasis only: names and celebratory lines, never UI text.

**Dashboard motion.** `app/(dashboard)/dashboard/template.tsx` wraps pages in `PageEnter`: top-level blocks rise in on in-app navigation, content that streams in after a skeleton animates when it arrives, and hard loads show content instantly (no flash). The wizard and editor are skipped because their fixed action bars must not sit inside a transformed parent. Other pieces:

- The header navigation highlight glides between links, and the phone tab bar's highlight pops in under the active tab.
- Invitation cards tilt toward the pointer through `useTilt`, on a wrapper so the CSS hover lift is untouched. They also get a light sweep and a "days to go" chip.
- Overview stats count up.
- The overview hero (`features/dashboard/overview-hero.tsx`) shows a live countdown to the next event from `getOverviewSummary`.

**Editor.** The editor (`features/invitations/editor/`) works like this:

- **Toolbar:** a floating bar holding back, `TemplateSwitcher` (a quick design switch with an Undo toast), the settings gear, `ViewToggle` (Edit / Preview) and Publish.
- **Edit view:** collapsible `EditorSection` cards (Basic information, Schedule, Photos, Look & feel). Collapsed content stays mounted but inert, so forms keep their state.
- **Preview view:** the invitation at the current screen width. There is no device switcher.
- **Sheets:** settings and publishing open as dialog sheets.
- **State:** UI state lives in the editor store (`view`, `openSections`, `settingsOpen`, `publishOpen`). `goTo(target)` opens the right section or sheet from a publish check.

**Dates must be deterministic.** `lib/utils/dates.ts` formats with fixed month and weekday tables instead of `Intl` output, because Node and browsers ship different CLDR data and the mismatch caused hydration errors.

**Build cache.** If a production build does not reflect a CSS change, delete `.next/cache` and build again. A stale Turbopack cache served old CSS once during development.

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

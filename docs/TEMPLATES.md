# Templates

All invitation designs follow one pattern so they stay consistent and easy to maintain.

## How rendering works

`InvitationRenderer` (`features/templates/renderer.tsx`) is the single rendering path used by the editor preview, catalogue cards, live demos (`/demo/[slug]`) and the public page (`/e/[slug]`). It looks up the template in `features/templates/registry.ts`, resolves the theme, and renders the template component.

| Piece | Location |
| --- | --- |
| Template components | `features/templates/designs/*.tsx`, one file per design |
| Shared design helpers | `features/templates/designs/shared.tsx` (hero title, monogram, cover image, ornaments) |
| Shared sections | `features/templates/sections/` (countdown, details, schedule, gallery, lightbox, RSVP form, contacts, gifts, calendar actions, branding) |
| Registry | `features/templates/registry.ts` |
| Theme resolution | `features/templates/theme.ts` |
| Sample content for previews | `features/templates/sample-data.ts` |

## Guest experience and motion

On the public page (`/e/[slug]`) and the live demo (`/demo/[slug]`) the renderer wraps every template in `InvitationExperience` (`features/templates/motion/`):

- **Opening card** (`opening-cover.tsx`): a welcome card over a blurred, tinted backdrop, with corner blooms, a heart (or sparkle) badge, the names, the date and an Open button. Opening ripples the badge, blooms the corners outwards, bursts blossoms from the card and lifts it away. Guests open it with the button, Enter, Space or Escape. A `?guest=Name` link adds “Cordially invites Name”. Owners can turn it off (Settings → Opening card). Links with a hash (such as `#rsvp`) skip it, and without JavaScript it is hidden.
- **Celebration burst** (`burst.ts`): six-petal blossoms in pink tones (`petals`) or the accent colour (`sparkles`, mixed with stars), or confetti, chosen by the definition's `particles` field.
- **Smooth scrolling** with Lenis, and **scroll motion** with GSAP: the motion engine in `motion/engine/` (see below).
- **Reading progress** (`scroll-progress.tsx`): a hairline in the accent colour along the top edge.
- **Background music** (`background-music.tsx`): starts with the Open tap, with a mute button in the corner.
- **Quick-action dock** (`action-dock.tsx`): Directions, Calendar, RSVP and Share, shown once the guest scrolls.

Previews (the editor, catalogue cards and marketing mockups) render statically: no opening card, no motion, no dock.

### Motion engine

Templates opt into motion with data attributes and never write GSAP code themselves. Each attribute is handled by one effect in `features/templates/motion/engine/effects/`, run in the order listed in `engine/registry.ts` inside a `gsap.matchMedia()` context (so everything reverts cleanly, and nothing runs under reduced motion):

| Attribute | Effect (file) |
| --- | --- |
| `data-inv-hero` | Plays in the opening sequence, in DOM order (`hero.ts`) |
| `data-inv-hero="title"` | Main title, letter by letter or word by word, per the preset (`HeroTitle` sets it) |
| `data-inv-reveal` | Fades and rises when scrolled into view, batched (`rise.ts`) |
| `data-inv-reveal="split"` | Heading lines rise out of a mask (`Section` titles use it) (`split.ts`) |
| `data-inv-reveal="words"` | A passage lights up word by word with the scroll. Use it for the welcome text and the closing message only (`words.ts`) |
| `data-inv-reveal="stagger"` | Direct children rise one after another (`stagger.ts`) |
| `data-inv-reveal="mask"` | Image unmasks upwards (put it on the cover image wrapper) (`mask.ts`) |
| `data-inv-depth="0.08"` | The image inside an overflow-hidden frame drifts against the scroll; pair it with `mask` on cover frames (`depth.ts`) |
| `data-inv-reveal="draw"` | SVG strokes draw in; `[data-line]` children grow (`draw.ts`) |
| `data-inv-speed="0.2"` | The element drifts against the scroll: ornaments and florals (`drift.ts`) |
| `data-inv-exit` | On the hero: eases back and dims as the guest scrolls on, so the page slides over it (`exit.ts`) |

**Presets.** A definition's `motion` field (`"gentle"`, `"editorial"` or `"playful"`, in `engine/presets.ts`) sets duration, travel, easing, stagger, title style and parallax depth for every effect. It is the template's motion character, not per-element tuning: Eternal Grace and Soft Pastel are gentle, Golden Gala, Botanical Noir and Modern Minimal are editorial, and Confetti Pop is playful.

**Adding an effect.** Write `effects/<name>.ts` exporting a `MotionEffect` (`reveal: "<variant>"` to own a `data-inv-reveal` value, or `selector` for its own attribute), read timing from `ctx.preset`, register it in `engine/registry.ts`, and add it to this table. Effects must only touch their own elements, start from content that is already visible, and leave it visible.

Shared sections already carry these attributes, so a new template gets most of the motion for free. Mark only the hero elements and decorative pieces. Unrevealed content is hidden with `opacity` only, never `visibility`, so it stays focusable and readable by screen readers. Do not add `data-inv-reveal` to elements that mount later (for example a status that appears after a submit): they would be hidden until the 2.5s failsafe.

Shared building blocks for reference-style layouts:

- `SaveTheDate`: dotted date plus a month calendar with the day circled.
- `Countdown`: three states (counting down, "The celebration has begun" until `endsAt` or 12 hours after the start, then "Thank you for celebrating with us").
- `ShareMoments`: the hashtag, a copy button and Share invitation.
- `Invocation`: the owner's blessing line, in any script.
- `Section index={n}`: a numbered chapter eyebrow.
- `Gallery layout={theme.gallery}`: the owner's choice (Look & feel → Gallery style), a carousel by default. The carousel (`gallery-carousel.tsx`) lays photos out like hand-placed prints: each rests slightly tilted and offset, and the centred one straightens and comes forward. Touch scrolls natively with snapping. A mouse drag carries momentum and settles on the nearest photo. Tapping a side photo brings it forward, and tapping the centred one opens the full-screen viewer (swipe, arrows, counter). Keyboard: arrows, Home and End. It also works in the scaled editor preview. A definition can change the default with `defaults.gallery`.

## Templates are recipes

Every design in `features/templates/designs/` is a definition (name, categories, palettes, fonts, motion) plus a **recipe**, built with `defineTemplate` (`features/templates/compose/`):

- `ComposedTemplate` (`compose/composed-template.tsx`) is the one page skeleton: section order, the `#details` / `#rsvp` ids the dock links to, chapter numbering, motion attributes and accessibility live here once.
- A recipe (`compose/recipe.ts`) chooses the look: a **hero** (`compose/heroes/`), a **cover frame**, the section **frame** (`"headed"`: eyebrow and title, centred or left; `"sidebar"`: editorial rows with a side label), copy for each heading, style tokens per section (classes passed to the shared sections), a closing variant and optional backdrop, ornaments and tail (footer).
- Heroes, cover frames and ornaments are shared, so a new template can reuse them: `compose/heroes/` (arch, deco, botanical, editorial, sticker, soft, temple, poster, party, ticket), `compose/frames.tsx` (covers, backdrops, closing ornaments) and `art/` (marigold toran, mandala, balloons, wave, blob).

| Template | Hero | Frame | Motion | Best for |
| --- | --- | --- | --- | --- |
| Eternal Grace | arch | headed, numbered | gentle | weddings, engagements |
| Botanical Noir | botanical | headed, numbered | editorial | evening weddings |
| Golden Gala | deco | headed, numbered | editorial | black tie, anniversaries |
| Modern Minimal | editorial | sidebar | editorial | any occasion |
| Confetti Pop | sticker | headed | playful | birthdays, parties |
| Soft Pastel | soft | headed | gentle | showers, family |
| Kalyanam | temple | headed, numbered | gentle | Indian weddings, griha pravesh |
| Monochrome | poster | headed left, numbered | editorial | modern, typographic |
| Balloon Bash | party | headed | playful | kids' birthdays, showers |
| Summit | ticket | headed left, numbered | editorial | conferences, galas, launches |

## Palettes

Palettes live with their template, and can also come from the shared library: `daisy("lofi", "black", …)` from `features/templates/palettes` adds palettes converted from daisyUI themes (MIT). daisyUI itself is not installed: its themes would override the app's design tokens. `scripts/generate-daisy-palettes.mjs` maps each theme onto the invitation roles and adjusts it to WCAG AA, writing `palettes/daisy.generated.ts`. To add themes, edit its list and run `node scripts/generate-daisy-palettes.mjs`.

`tests/unit/palettes.test.ts` checks every palette of every template: text, muted text and button text at 4.5:1 or more, and the accent at 4.5:1 (3:1 for the six original designs, whose accents are decorative gold and pastel tones).

## Adding a template

1. Create `features/templates/designs/<key>.tsx` exporting `defineTemplate({ key, name, description, categories, tier, sections, defaultSections, palettes, fontPairings, defaults, previewGradient, particles, motion, recipe })`. Start from the closest existing recipe and change the hero, frame, copy and tokens.
2. Reuse a hero or write one in `compose/heroes/`: mark its root with `data-inv-exit`, its parts with `data-inv-hero`, use `HeroTitle` for the title and render `<Invocation>` first. New cover frames go in `compose/frames.tsx` with `data-inv-reveal="mask" data-inv-depth="0.08"` on the photo wrapper.
3. Style only with the theme custom properties (`--inv-bg`, `--inv-surface`, `--inv-text`, `--inv-muted`, `--inv-accent`, `--inv-accent-contrast`, `--inv-border`, `--inv-c2`, `--inv-c3`, `--inv-font-display`, `--inv-font-body`). Fixed colours are only for illustrations (marigolds, leaves).
4. Fonts come from `features/templates/fonts.ts` (self-hosted, loaded only when used). Add new families there, and to `tests/mocks/next-font-google.ts`.
5. Register it in `TEMPLATE_REGISTRY` in `registry.ts`, and add a catalogue row in a new migration with `slug` and `renderer_key` equal to the key.
6. Run `pnpm test` (registry integrity and palette contrast), then check it visually: `pnpm test:visual --update-snapshots -g <key>` records screenshots of its live demo on phone and desktop.

## Refactoring safely

`pnpm test:visual` screenshots every template's live demo (two occasions each, phone and desktop, reduced motion) and compares against baselines recorded on your machine. Record before a change (`--update-snapshots`), compare after. Baselines are not committed (rendering differs between machines).

## Free or premium

The `tier` in the definition documents intent. The badge and the publish check read `templates.tier` in the database, so change that through `/admin/templates` or a migration.

## Removing a template

Delete its file and registry entry. Then add a migration that moves existing invitations to another template supporting the same categories, and deletes the row. See `20261021000004_remove_cinematic_templates.sql` for an example. Never edit migrations that may already have been applied.

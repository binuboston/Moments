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

- **Opening envelope** (`opening-cover.tsx`): a sealed envelope styled from the template's palette, with the monogram on a wax seal. Guests open it with the button, Enter, Space or Escape. Owners can turn it off (Settings → Opening envelope). Links with a hash (such as `#rsvp`) skip it, and without JavaScript it is hidden.
- **Celebration burst** (`burst.ts`): petals, confetti or sparkles, chosen by the definition's `particles` field.
- **Smooth scrolling** with Lenis, and **scroll motion** with GSAP (`use-invitation-motion.ts`).
- **Quick-action dock** (`action-dock.tsx`): Directions, Calendar, RSVP and Share, shown once the guest scrolls.

Previews (the editor, catalogue cards and marketing mockups) render statically: no envelope, no motion, no dock.

Templates opt into motion with data attributes and never write GSAP code themselves:

| Attribute | Effect |
| --- | --- |
| `data-inv-hero` | Plays in the opening sequence, in DOM order |
| `data-inv-hero="title"` | Main title, revealed character by character (`HeroTitle` sets it) |
| `data-inv-reveal` | Fades and rises when scrolled into view |
| `data-inv-reveal="split"` | Heading lines rise out of a mask (`Section` titles use it) |
| `data-inv-reveal="mask"` | Image unmasks upwards (put it on the cover image wrapper) |
| `data-inv-reveal="draw"` | SVG strokes draw in; `[data-line]` children grow |
| `data-inv-reveal="stagger"` | Direct children rise one after another |
| `data-inv-speed="0.2"` | Parallax drift |

Shared sections already carry these attributes, so a new template gets most of the motion for free. Mark only the hero elements and decorative pieces. Unrevealed content is hidden with `opacity` only, never `visibility`, so it stays focusable and readable by screen readers. Do not add `data-inv-reveal` to elements that mount later (for example a status that appears after a submit): they would be hidden until the 2.5s failsafe.

Shared building blocks for reference-style layouts:

- `SaveTheDate`: dotted date plus a month calendar with the day circled.
- `Countdown`: three states (counting down, "The celebration has begun" until `endsAt` or 12 hours after the start, then "Thank you for celebrating with us").
- `ShareMoments`: the hashtag, a copy button and Share invitation.
- `Invocation`: the owner's blessing line, in any script.
- `Section index={n}`: a numbered chapter eyebrow.

## Adding a template

1. Create `features/templates/designs/<key>.tsx`. Export a `TemplateDefinition` with the key, name, description, categories, tier, sections, default sections, palettes, font pairings, defaults, preview gradient and component.
2. Build the layout from the shared sections and helpers instead of copying markup. Use `HeroTitle` for the title so couple names and headlines behave the same in every design.
3. Style with the theme custom properties (`--inv-bg`, `--inv-text`, `--inv-muted`, `--inv-accent`, `--inv-accent-contrast`, `--inv-border`, `--inv-font-display`, `--inv-font-body`), never hard-coded colours.
4. Mark the hero with `data-inv-hero`, put `data-inv-reveal="mask"` on the cover image wrapper, give the details and RSVP sections `id="details"` and `id="rsvp"` (the dock links to them), render `<Invocation>` first in the hero and `<ShareMoments>` before the branding, and set `particles`.
5. Register it in `TEMPLATE_REGISTRY` in `registry.ts`.
6. Add a catalogue row in a new migration, with `slug` and `renderer_key` equal to the key.
7. Run `pnpm test`. `tests/unit/template-registry.test.ts` checks that every template in the database has a renderer and that definitions are internally consistent.

## Free or premium

The `tier` in the definition documents intent. The badge and the publish check read `templates.tier` in the database, so change that through `/admin/templates` or a migration.

## Removing a template

Delete its file and registry entry. Then add a migration that moves existing invitations to another template supporting the same categories, and deletes the row. See `20261021000004_remove_cinematic_templates.sql` for an example. Never edit migrations that may already have been applied.

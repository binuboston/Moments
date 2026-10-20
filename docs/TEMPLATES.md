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

## Adding a template

1. Create `features/templates/designs/<key>.tsx`. Export a `TemplateDefinition` with the key, name, description, categories, tier, sections, default sections, palettes, font pairings, defaults, preview gradient and component.
2. Build the layout from the shared sections and helpers instead of copying markup. Use `HeroTitle` for the title so couple names and headlines behave the same in every design.
3. Style with the theme custom properties (`--inv-bg`, `--inv-text`, `--inv-muted`, `--inv-accent`, `--inv-accent-contrast`, `--inv-border`, `--inv-font-display`, `--inv-font-body`), never hard-coded colours.
4. Register it in `TEMPLATE_REGISTRY` in `registry.ts`.
5. Add a catalogue row in a new migration, with `slug` and `renderer_key` equal to the key.
6. Run `pnpm test`. `tests/unit/template-registry.test.ts` checks that every template in the database has a renderer and that definitions are internally consistent.

## Free or premium

The `tier` in the definition documents intent. The badge and the publish check read `templates.tier` in the database, so change that through `/admin/templates` or a migration.

## Removing a template

Delete its file and registry entry. Then add a migration that moves existing invitations to another template supporting the same categories, and deletes the row. See `20261021000004_remove_cinematic_templates.sql` for an example. Never edit migrations that may already have been applied.

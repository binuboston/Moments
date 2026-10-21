# Design system

Invite has two visual layers that share one brand:

- **App** (home, invitations, editor, templates, support pages, admin): a Pinterest-inspired language. White canvas, near-black ink, soft grey pills, one bold raspberry red for the main action, and image-first "pins" with 16px corners in masonry. Described here.
- **Invitations** (templates): each design has its own palette and fonts through `--inv-*` variables. See [TEMPLATES.md](TEMPLATES.md).

They meet in the brand motifs (`components/brand/`): the six-petal blossom, corner blooms, celebration bursts, and the serif used for emphasis.

## Principles

1. **Content is the colour.** The canvas is white. Panels are flat, with a hairline; menus float with a soft glow; pins have no chrome at all.
2. **One radius per role.** Cards and pins use `rounded-card` (16px); icon tiles use `rounded-tile` (12px); buttons, chips, search and segmented controls are full pills.
3. **Colour means something.** Raspberry (`primary`, #e11d48) marks the one main action on a screen; the current navigation item is near-black. Pastel tones identify things (an occasion, a stat), never actions.
4. **Soft secondary actions.** Inside a card, secondary actions use the `soft` button: a grey fill and no border.
5. **Tokens only.** Use the tokens and utilities below, never raw hex values or one-off shadows in components.

## Tokens (`app/globals.css`)

| Token | Utility | Use |
| --- | --- | --- |
| `--canvas`, `--canvas-edge` | `app-canvas` | Page background (white) |
| `--status-draft`, `--status-live`, `--status-off` | `bg-status-*` | Status dots in lists (`StatusDot`): a coloured dot instead of a text badge. Shape-only signals; the filter chips act as the legend, and the dot carries the label for screen readers and as a tooltip. Use `StatusBadge` (with text) where there is room. |
| `--surface` + `--elevation-card` + `--card-radius` | `surface-card` | Every card or panel on the canvas; `Card` uses it |
| `--elevation-card-hover` | `surface-hover` | Lift and deeper shadow for interactive cards |
| `--elevation-float` | `surface-float` | Sticky or floating chrome: top bar, tab bar, admin header (translucent and blurred) |
| `--fill`, `--fill-hover` | `bg-fill`, `hover:bg-fill-hover` | Soft controls on white: `soft` buttons, corner icon buttons, count chips |
| `--tone-*`, `--tone-*-ink` | `bg-tone-rose text-tone-rose-ink`, … | Pastel identity tiles; nine tones: rose, violet, amber, peach, teal, green, lime, blue, slate |
| `--tile-radius` | `rounded-tile` | Icon tiles |
| `--font-serif` (Fraunces) | `font-serif` | Emphasis only: a name, a celebratory line. Never UI labels |
| Motion tokens | `--ease-out-quart`, `--duration-*`; `lib/motion/tokens.ts` | All transitions and GSAP timelines |

## Components

| Component | Where | Notes |
| --- | --- | --- |
| `Card` | `components/ui/card.tsx` | Borderless `surface-card`. Add `surface-hover` when the whole card is interactive |
| `IconTile` | `components/ui/icon-tile.tsx` | `icon` + `tone` + `size` (`sm`, `md`, `lg`) |
| `Button variant="soft"` | `components/ui/button.tsx` | The secondary action inside cards. A full-width soft pill is the card's main action |
| Corner action | a `soft` `icon-sm` button, or a decorative `size-8 rounded-full bg-fill` arrow | Top-right of a card, aligned with the icon tile |
| `categoryStyle(slug)` | `lib/design/tones.ts` | The tone and icon for an occasion; use it everywhere a category appears |
| Brand motifs | `components/brand/` | `Blossom`, `CornerBloom`, `burst`, `useCelebrate()` |

## Card anatomy

```
┌───────────────────────────────┐  surface-card (+ surface-hover), p-4 to p-5
│ [tone tile]               (↗) │  IconTile, corner soft circle
│                               │
│ Title, up to two lines        │  text-lg font-semibold tracking-tight
│ Supporting text, muted        │  text-sm text-muted-foreground
│                               │
│ [    Soft full-width action  ]│  Button variant="soft" className="w-full"
└───────────────────────────────┘
```

An invitation card follows the same anatomy, with the design thumbnail inset at the top (`rounded-[calc(var(--card-radius)-0.5rem)]` inside `p-2.5`).

## Layout

- **Shell** (`components/layout/app-shell.tsx`, used by every app and marketing page):
  - **Desktop:** a 72px icon rail (logo mark, Home, Templates, Create, Invitations, plus "Settings & support" at the foot, which holds How it works, Pricing, Help, About, Terms and Privacy).
  - **Top bar:** the global search (a 48px grey pill with a results dropdown, ⌘K) and the account menu (or Log in / Sign up). It is the only search in the product: inner screens use filters, not search boxes.
  - **Phones:** a top bar with the wordmark, account and a search button that opens full-screen search, plus a bottom tab bar (Home, Templates, Create, Invitations, Menu). The tab bar steps aside in the wizard and editor.
- **Pins.** Templates and invitations are shown as pins: the preview or thumbnail first, no card chrome, a darkening scrim on hover with a red action pill (Use / Edit), the title underneath. Feeds use CSS-column masonry (`columns-2 … xl:columns-5`).
- **Grids.** Use `gap-4` on phones and `gap-5` from `sm` up. Cards stretch to equal height (`h-full`).
- **Toolbars on the canvas.** Filters are a white segmented pill with a dark active segment. Lists never get their own search box (search is global).

## Motion

Use the same motion everywhere:

- **Hover:** cards lift 3px with a deeper shadow; corner arrows turn 45°; icon tiles tilt.
- **Navigation:** page blocks rise in (`PageEnter`).
- **Moments:** blossom bursts (`useCelebrate`).

Everything respects reduced motion. See ARCHITECTURE.md §10c.

## Checklist for new screens

- The shell provides `app-canvas`; never set page backgrounds yourself.
- Use `Card` or `surface-card` for panels, with no `border` classes.
- Icons that identify something go in an `IconTile` with a tone; actions use `Button`.
- Inside cards, `soft` is the secondary style; `primary` is only for the one main action on a screen.
- No raw colours, shadows or radii: add a token first if something is missing.

## Light and dark

- The app chrome has light and dark themes. The default is **System** (follows the device, live). People can choose System, Light or Dark from the phone Menu sheet, the desktop "Settings & support" menu, or Settings. The choice is kept in this browser (`localStorage`, `invite:theme`).
- Dark values are the same tokens re-tuned under `.dark` in `app/globals.css`, so components never need `dark:` overrides when they use tokens. Use the `dark:` variant only for one-off cases.
- The pre-paint script (`lib/motion/pre-paint.ts`) sets the `dark` class and `color-scheme` before first paint, so there is no flash of the wrong theme. `lib/theme.ts` keeps it in sync after that, including the browser's theme colour.
- Invitations (templates, previews, card images) are not themed: they always show the owner's chosen palette.


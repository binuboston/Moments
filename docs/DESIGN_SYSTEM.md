# Design system

Mirth has two visual layers that share one brand:

- **App** (dashboard, editor, admin): calm, floating, borderless surfaces on a cool grey canvas. Described here.
- **Invitations** (templates): each design has its own palette and fonts through `--inv-*` variables. See [TEMPLATES.md](TEMPLATES.md).

They meet in the brand motifs (`components/brand/`): the six-petal blossom, corner blooms, celebration bursts, and the serif used for emphasis.

## Principles

1. **Elevation, not borders.** App surfaces are white and separated from the canvas by soft shadows. Borders appear only inside a surface (a divider, a form field) or on overlays.
2. **One radius per role.** Cards use `rounded-card` (24px); icon tiles use `rounded-tile` (14px); buttons, chips and segmented controls are full pills.
3. **Colour means something.** Garnet (`primary`) marks the main action and the current state. Pastel tones identify things (an occasion, a stat), never actions.
4. **Soft secondary actions.** Inside a card, secondary actions use the `soft` button: a grey fill and no border.
5. **Tokens only.** Use the tokens and utilities below, never raw hex values or one-off shadows in components.

## Tokens (`app/globals.css`)

| Token | Utility | Use |
| --- | --- | --- |
| `--canvas`, `--canvas-edge` | `app-canvas` | Background of every app shell (dashboard, admin) |
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

- **Header.** One header (`components/layout/app-header.tsx`) serves the whole product, both the marketing site and the app. It is a floating `surface-float` bar, aligned to the `max-w-6xl` column. The logo always goes to the landing page. Next to it is the shared `PrimaryNav` (Templates, How it works, Pricing, My invitations) with a gliding highlight, then a global "New invitation" button and the account menu, which holds the plan, Settings, Admin and Log out. On phones the navigation moves into a menu sheet. In the app, the header paints a canvas backing so content never shows through. There is no sidebar and no tab bar.
- **Grids.** Use `gap-4` on phones and `gap-5` from `sm` up. Cards stretch to equal height (`h-full`).
- **Toolbars on the canvas.** Search is a white pill input (`border-0 bg-surface shadow-card`); filters are a white segmented pill with a dark active segment.

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

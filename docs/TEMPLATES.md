# Template engine

Mirth has two kinds of templates, both registered in `features/templates/registry.ts` and rendered by the single `InvitationRenderer` (editor preview, catalogue cards, live demos and the public page all use it).

| Kind | Where | How it is built |
| --- | --- | --- |
| Classic | `features/templates/designs/*.tsx` | One React component per template |
| Cinematic | `features/templates/cinematic/templates/*.ts` | A validated **art-direction config** over shared sections, motion and artwork |

New premium designs should be cinematic. Most of a new template is configuration.

## Adding a cinematic template

1. **Write the config** in `features/templates/cinematic/templates/<key>.ts`, typed `ArtDirectionInput` (see `art-direction.ts`). It declares:
   - `palettes`: every role (`bg`, `text`, `muted`, `accent`, `accentInk`, contrast band roles, `bloom`, `leaf`).
   - `fonts`: display, body and script faces from `FONT_FAMILIES` (`features/templates/fonts.ts`). Devanagari and Malayalam are appended automatically.
   - `opening`: `envelope`, `gatefold` or `layered-card`, plus `petals`, `gold-dust` or `none`.
   - `layouts`: variants for hero (`arch`, `framed`, `editorial`), save-the-date (`calendar`, `monumental`), gallery (`mosaic`, `filmstrip`, `columns`) and closing (`botanical`, `photo`).
   - `blocks`: section order. `contrastBlocks` puts chosen sections on the contrast band.
2. **Register it** by adding the config to `CINEMATIC_TEMPLATES` in `registry.ts`.
3. **Add a catalogue row** in a new migration (`slug` and `renderer_key` equal to the key).
4. **Run the tests.** `tests/unit/cinematic.test.ts` validates the config and checks every text role against WCAG AA (4.5:1). `tests/unit/template-registry.test.ts` checks that database rows and renderers match.

A broken config fails at module load, so it fails the tests and the build rather than production.

Only add code when a template needs something new: a layout variant in `sections/`, an ornament in `art/`, or an opening style in `motion/opening-timelines.ts` plus `sections/opening-cover.tsx`.

## Colour rules

- `accent` is for linework, fills and large flourishes. It may be low contrast (champagne gold on ivory is 2.1:1).
- `accentInk` and `contrastAccentInk` are for gold-coloured *text*. They must pass 4.5:1, and the test enforces it.
- Text over photography sits inside `.cine-on-photo`, which switches every ink to light values.

## Responsive behaviour

Cinematic sections use **container queries**, not viewport breakpoints. The renderer root is an `@container`; sections use `@2xl:` (about 672px), `@3xl:` and `@5xl:`, and `cqw` instead of `vw`. A 390px editor or catalogue frame therefore shows the true phone layout even on a desktop screen. Do not use `sm:`, `md:`, `lg:` or `vw` inside `features/templates/cinematic`.

## Motion model

Each element has exactly one owner:

| Effect | Owner |
| --- | --- |
| Opening cover timeline | GSAP (`motion/opening-timelines.ts`), loaded on first tap |
| Hero entrance | CSS transitions triggered by the `hero-play` class when the cover opens (`data-hero`, `--d` delays) |
| Scroll reveals (`data-reveal="up" \| "mask" \| "draw" \| "line" \| "line-y"`) | IntersectionObserver in `MotionRoot` adds `is-revealed`; CSS animates |
| Parallax (`data-parallax`) | GSAP ScrollTrigger, full-page modes only, capable devices only |
| Ambient float, petals, digit roll | CSS keyframes |

Safety rules:

- Hidden initial states only apply under `.motion-ready`, which is added after hydration. Without JavaScript everything is visible and a `<noscript>` rule hides the cover.
- Mask reveals clip the **child** element. Chromium's IntersectionObserver never reports a fully clip-pathed target as intersecting.
- `prefers-reduced-motion` gives instant reveals and a 220ms cover fade. Data-saver, four or fewer CPU cores, or 2GB or less memory gives the "lite" mode: no parallax, particles or ambient float.
- A MutationObserver re-scans reveal targets, so content added while editing in the live preview still appears.

## Render modes

| Mode | Used by | Cover | Saves RSVPs |
| --- | --- | --- | --- |
| `public` | `/e/[slug]` | Fixed overlay, remembered per tab | Yes |
| `demo` | `/demo/[slug]` live demos | Fixed overlay | No |
| `preview` | Editor, catalogue, marketing | Inside the frame (editor only, with "Replay opening") | No |

`motion="static"` (catalogue cards, marketing mockups) renders everything visible with no cover.

## Content fields

Cinematic templates read the optional "Traditional touches" fields: `invocation`, `regionalTitle`, `ceremonyLabel`, `city`, `familyMessage` and `hashtag`. They exist on every event type and default to empty, so older invitations parse unchanged.

## Honest dates

`countdownPhase()` in `cinematic/model.ts` returns `upcoming`, `live` (until `endsAt`, otherwise 12 hours after the start) or `past`. The countdown section never shows a negative or fake countdown. It shows "The celebration has begun" and then "Thank you for celebrating with us".

## Directions

`directionsUrlFor()` uses the owner's maps link, else a Google Maps search for the typed venue and address, else nothing. Coordinates are never invented. The QR code encodes the same URL.

## Sample photography

`cinematic/sample-photos.ts` lists licensed Wikimedia Commons images used only in previews and demos, with credits in `docs/ASSET_CREDITS.md` and on `/help#sample-photography`. Choose detail shots without identifiable faces, and check the **full frame** before adding one, not just a thumbnail crop.

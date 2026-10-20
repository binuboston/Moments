import type { TemplateProps } from "@/features/templates/types";
import { Branding } from "@/features/templates/sections";
import { BLOCK_SECTION, type ArtDirection, type CinematicBlock } from "@/features/templates/cinematic/art-direction";
import { buildCinematicModel, type CinematicModel } from "@/features/templates/cinematic/model";
import { MotionRoot } from "@/features/templates/cinematic/motion/motion-root";
import { MOTION_PRESETS } from "@/features/templates/cinematic/motion/presets";
import { Closing } from "@/features/templates/cinematic/sections/closing";
import { CineSection } from "@/features/templates/cinematic/sections/common";
import { CinematicCountdown } from "@/features/templates/cinematic/sections/countdown";
import { CineContacts, CineGifts, CineRsvp, GalleryHeading } from "@/features/templates/cinematic/sections/extras";
import { CinematicGallery } from "@/features/templates/cinematic/sections/gallery";
import { Hero } from "@/features/templates/cinematic/sections/hero";
import { Introduction } from "@/features/templates/cinematic/sections/introduction";
import { OpeningCover } from "@/features/templates/cinematic/sections/opening-cover";
import { SaveTheDate } from "@/features/templates/cinematic/sections/save-the-date";
import { CineSchedule } from "@/features/templates/cinematic/sections/schedule";
import { Venue } from "@/features/templates/cinematic/sections/venue";

/**
 * Composition root for every cinematic template. Server-compatible: sections
 * render on the server for the public page; only small islands (cover,
 * countdown, gallery, calendar/share buttons, MotionRoot) hydrate.
 */
export function CinematicInvitation({ view, theme, mode, motion, art }: TemplateProps & { art: ArtDirection }) {
  const model = buildCinematicModel(view, { eager: mode !== "preview" && motion === "full" });
  const preset = MOTION_PRESETS[art.motion];

  const isOn = (block: CinematicBlock) => {
    const key = BLOCK_SECTION[block];
    if (!key) return true;
    // Countdown stays visible after the date so guests see an honest "thank you" state.
    if (block === "countdown") return view.theme.sections.countdown ?? true;
    return theme.sections[key];
  };
  const contrast = (block: CinematicBlock) => art.contrastBlocks.includes(block);
  const openingEnabled = motion === "full" && theme.sections.opening;

  return (
    <MotionRoot motion={motion} mode={mode} slug={view.slug} openingEnabled={openingEnabled} parallax={preset.parallax} className="text-(--inv-text)">
      {/* Hides the cover when JavaScript is unavailable so the invitation is always readable. */}
      <noscript>
        <style>{"[data-cinematic-cover]{display:none!important}"}</style>
      </noscript>
      {openingEnabled ? (
        <OpeningCover
          art={art}
          slug={view.slug}
          mode={mode}
          text={{ invocation: model.invocation, regionalTitle: model.regionalTitle, title: model.title, monogram: model.monogram, dateLabel: model.numericDateLabel, placeLabel: model.city || model.venueName }}
        />
      ) : null}
      <article className="w-full" aria-label={`Invitation: ${model.shareTitle}`}>
        <span id={`cine-start-${view.slug}`} tabIndex={-1} className="sr-only">
          Start of invitation
        </span>
        {art.blocks.map((block) => (isOn(block) ? <Block key={block} block={block} model={model} art={art} props={{ view, theme, mode, motion }} contrast={contrast(block)} step={preset.heroStep} /> : null))}
        <Branding show={view.showBranding} className="pt-8" />
      </article>
    </MotionRoot>
  );
}

function Block({ block, model, art, props, contrast, step }: { block: CinematicBlock; model: CinematicModel; art: ArtDirection; props: TemplateProps; contrast: boolean; step: number }) {
  const { view, theme, mode } = props;
  switch (block) {
    case "hero":
      return <Hero model={model} art={art} step={step} contrast={contrast} />;
    case "introduction":
      return <Introduction model={model} contrast={contrast} />;
    case "saveTheDate":
      return <SaveTheDate model={model} art={art} contrast={contrast} />;
    case "countdown":
      return (
        <CineSection contrast={contrast} aria-label="Countdown">
          <div data-reveal="up">
            <CinematicCountdown model={model} />
          </div>
        </CineSection>
      );
    case "venue":
      return <Venue model={model} contrast={contrast} />;
    case "schedule":
      return <CineSchedule functions={view.functions} contrast={contrast} />;
    case "gallery":
      return (
        <CineSection contrast={contrast} id="gallery" aria-labelledby="cine-gallery">
          <div className="mx-auto max-w-6xl">
            <GalleryHeading model={model} />
            <CinematicGallery items={model.gallery} layout={art.layouts.gallery} />
          </div>
        </CineSection>
      );
    case "rsvp":
      return <CineRsvp view={view} mode={mode} contrast={contrast} />;
    case "gifts":
      return <CineGifts view={view} contrast={contrast} />;
    case "contacts":
      return <CineContacts view={view} contrast={contrast} />;
    case "closing":
      return <Closing model={model} art={art} mode={mode} showMessage={theme.sections.message} contrast={contrast} />;
  }
}

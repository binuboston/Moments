import { Balloon } from "@/features/templates/art/balloons";
import { Blob } from "@/features/templates/art/blob";
import { Mandala } from "@/features/templates/art/mandala";
import { Confetti, CoverImage, LeafOrnament, RuleOrnament } from "@/features/templates/designs/shared";
import type { MediaItem } from "@/features/templates/types";

/*
 * Cover frames, backdrops and closing ornaments shared by recipes. Covers are
 * marked for the mask reveal and in-frame parallax (see the motion engine).
 */

export function ArchCover({ media }: { media: MediaItem }) {
  return (
    <div className="relative mx-6 aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-2xl ring-1 ring-(--inv-accent)/30 ring-offset-8 ring-offset-(--inv-bg) sm:mx-16 sm:aspect-[3/4]" data-inv-reveal="mask" data-inv-depth="0.08">
      <CoverImage media={media} priority />
    </div>
  );
}

export function DecoCover({ media }: { media: MediaItem }) {
  return (
    <div className="relative mx-6 aspect-[3/4] overflow-hidden border border-(--inv-accent)/50 p-2 sm:mx-12">
      <div className="relative h-full w-full overflow-hidden" data-inv-reveal="mask" data-inv-depth="0.08">
        <CoverImage media={media} priority />
      </div>
    </div>
  );
}

/** Rounded frame whose photo fades into the background at the bottom. */
export function GlowCover({ media }: { media: MediaItem }) {
  return (
    <div className="relative mx-6 aspect-[4/5] overflow-hidden rounded-[2rem] ring-1 ring-(--inv-accent)/40 sm:mx-12" data-inv-reveal="mask" data-inv-depth="0.08">
      <CoverImage media={media} priority className="opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-t from-(--inv-bg) via-transparent to-transparent" />
    </div>
  );
}

export function StickerCover({ media }: { media: MediaItem }) {
  return (
    <div className="relative mx-6 aspect-square overflow-hidden rounded-[2.5rem] border-2 border-(--inv-text) shadow-[10px_10px_0_0_var(--inv-c3)] sm:mx-16" data-inv-reveal="mask" data-inv-depth="0.08">
      <CoverImage media={media} priority />
    </div>
  );
}

export function PebbleCover({ media }: { media: MediaItem }) {
  return (
    <div className="relative mx-8 aspect-[4/5] overflow-hidden rounded-[45%_55%_50%_50%/55%_45%_55%_45%] sm:mx-24" data-inv-reveal="mask" data-inv-depth="0.08">
      <CoverImage media={media} priority />
    </div>
  );
}

export function WideCover({ media }: { media: MediaItem }) {
  return (
    <div className="relative mt-10 aspect-[16/10] overflow-hidden" data-inv-reveal="mask" data-inv-depth="0.08">
      <CoverImage media={media} priority />
    </div>
  );
}

/** A bold accent rule where an editorial layout would show its cover. */
export function AccentRule() {
  return (
    <div className="mx-6 mt-10 sm:mx-10" aria-hidden data-inv-reveal="draw">
      <div className="h-1.5 origin-left bg-(--inv-accent)" data-line />
    </div>
  );
}

export function LeavesBackdrop() {
  return (
    <>
      <div className="absolute -top-6 -left-8" data-inv-speed="-0.15">
        <LeafOrnament className="size-48 opacity-40 sm:size-64" />
      </div>
      <div className="absolute top-40 -right-10" data-inv-speed="0.2">
        <LeafOrnament className="size-48 rotate-180 opacity-30 sm:size-64" />
      </div>
    </>
  );
}

export function BlobsBackdrop() {
  return (
    <>
      <div className="absolute -top-20 -left-24" data-inv-speed="-0.2">
        <Blob className="size-72 text-(--inv-c2) opacity-70 sm:size-96" />
      </div>
      <div className="absolute top-72 -right-28" data-inv-speed="0.25">
        <Blob className="size-72 text-(--inv-c3) opacity-60 sm:size-96" />
      </div>
    </>
  );
}

export function RuleDiamond() {
  return <RuleOrnament className="mb-8" />;
}

export function DrawnLine() {
  return (
    <div className="mx-auto mb-6 flex justify-center" aria-hidden data-inv-reveal="draw">
      <span className="h-px w-24 bg-(--inv-accent)" data-line />
    </div>
  );
}

export function ConfettiLayer() {
  return <Confetti className="opacity-60" />;
}

/** Pointed temple arch, as a clip-path shared by the frame and the photo. */
const TEMPLE_ARCH = "polygon(0% 100%, 0% 28%, 8% 18%, 18% 10%, 30% 4.5%, 42% 1.2%, 50% 0%, 58% 1.2%, 70% 4.5%, 82% 10%, 92% 18%, 100% 28%, 100% 100%)";

/** Photo inside a pointed temple arch with a brass-coloured border. */
export function TempleCover({ media }: { media: MediaItem }) {
  return (
    <div className="relative mx-8 aspect-[4/5] bg-(--inv-accent) p-1.5 sm:mx-20" style={{ clipPath: TEMPLE_ARCH }}>
      <div className="relative h-full w-full overflow-hidden" style={{ clipPath: TEMPLE_ARCH }} data-inv-reveal="mask" data-inv-depth="0.08">
        <CoverImage media={media} priority />
      </div>
    </div>
  );
}

/** Full-width black-and-white photo, for typographic layouts. */
export function MonoCover({ media }: { media: MediaItem }) {
  return (
    <div className="relative mt-10 aspect-[16/10] overflow-hidden" data-inv-reveal="mask" data-inv-depth="0.1">
      <CoverImage media={media} priority className="contrast-125 grayscale" />
    </div>
  );
}

/** A tilted instant photo with a thick white border. */
export function PolaroidCover({ media }: { media: MediaItem }) {
  return (
    <div className="mx-auto w-[min(80%,26rem)] rotate-2 bg-white p-3 pb-12 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.45)]">
      <div className="relative aspect-square overflow-hidden" data-inv-reveal="mask" data-inv-depth="0.06">
        <CoverImage media={media} priority sizes="(min-width: 640px) 26rem, 80vw" />
      </div>
    </div>
  );
}

/** Wide banner with soft corners, for formal events. */
export function BannerCover({ media }: { media: MediaItem }) {
  return (
    <div className="relative mx-6 aspect-[16/9] overflow-hidden rounded-2xl sm:mx-10 sm:aspect-[21/9]" data-inv-reveal="mask" data-inv-depth="0.08">
      <CoverImage media={media} priority />
    </div>
  );
}

export function MandalaMark() {
  return <Mandala className="mx-auto mb-8 size-24 text-(--inv-accent)" />;
}

export function BalloonPair() {
  return (
    <div className="mb-6 flex justify-center gap-1" aria-hidden data-inv-reveal>
      <Balloon color="var(--inv-accent)" className="w-10 -rotate-6 text-(--inv-text)" />
      <Balloon color="var(--inv-c2)" className="mt-3 w-8 rotate-6 text-(--inv-text)" />
    </div>
  );
}

import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { ArtDirection } from "@/features/templates/cinematic/art-direction";
import { Bouquet, Sprig, Toran } from "@/features/templates/cinematic/art/botanicals";
import { ArchFrame, FineFrame, LotusDivider, PaperGrain } from "@/features/templates/cinematic/art/ornaments";
import type { CinematicModel } from "@/features/templates/cinematic/model";
import { DisplayNames, Eyebrow } from "@/features/templates/cinematic/sections/common";
import { ParallaxImage } from "@/features/templates/cinematic/sections/parallax-image";

/** Inline delay for the hero entrance sequence (CSS reads --d). */
const d = (step: number, unit: number) => ({ "--d": `${step * unit}ms` }) as React.CSSProperties;

export function Hero({ model, art, step, contrast }: { model: CinematicModel; art: ArtDirection; step: number; contrast: boolean }) {
  const layout = art.layouts.hero;
  if (layout === "framed") return <FramedHero model={model} step={step} contrast={contrast} />;
  if (layout === "editorial") return <EditorialHero model={model} step={step} contrast={contrast} />;
  return <ArchHero model={model} step={step} contrast={contrast} />;
}

function Blessing({ model, step, className }: { model: CinematicModel; step: number; className?: string }) {
  if (!model.invocation && !model.regionalTitle) return null;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {model.invocation ? (
        <p className="inv-indic text-sm text-(--inv-accent-ink) @2xl:text-base" data-hero style={d(1, step)}>
          {model.invocation}
        </p>
      ) : null}
      {model.regionalTitle ? (
        <p className="inv-indic text-lg text-(--inv-muted) @2xl:text-xl" data-hero style={d(2, step)}>
          {model.regionalTitle}
        </p>
      ) : null}
    </div>
  );
}

function WhenWhere({ model, step, className }: { model: CinematicModel; step: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5 text-sm tracking-wide", className)} data-hero style={d(8, step)}>
      <p className="text-[0.7rem] font-medium tracking-[0.3em] uppercase">{model.weekdayDateLabel}</p>
      <p className="text-(--inv-muted)">
        {model.ceremonyLabel} · {model.timeLabel}
      </p>
      {model.placeLabel ? <p className="text-(--inv-muted)">{model.placeLabel}</p> : null}
    </div>
  );
}

function ArchHero({ model, step, contrast }: { model: CinematicModel; step: number; contrast: boolean }) {
  return (
    <section className={cn("relative isolate overflow-hidden px-5 pt-6 pb-20 @2xl:px-10 @2xl:pb-28", contrast && "cine-contrast")} aria-labelledby="cine-names">
      <PaperGrain opacity={0.08} />
      <Toran className="relative mx-auto -mt-2 w-full max-w-3xl" />
      <div className="relative mx-auto mt-2 w-full max-w-[34rem]">
        <ArchFrame className="absolute inset-0 h-full w-full" />
        <div className="relative flex flex-col items-center px-8 pt-20 pb-16 text-center @2xl:px-14 @2xl:pt-28">
          <Blessing model={model} step={step} />
          {model.hosts ? (
            <p className="mt-6 max-w-xs text-xs leading-relaxed text-(--inv-muted) italic" data-hero style={d(3, step)}>
              {model.hosts}
            </p>
          ) : null}
          {model.headline ? (
            <Eyebrow className="mt-6">
              <span data-hero style={d(3, step)} className="block">
                {model.headline}
              </span>
            </Eyebrow>
          ) : null}
          <h1 id="cine-names" className="inv-display mt-6 text-[clamp(3rem,14cqw,5.6rem)] leading-[0.95] text-balance" data-hero="mask" style={d(4, step)}>
            <DisplayNames title={model.title} />
          </h1>
          {model.subheading ? (
            <p className="inv-display mt-5 text-xl text-(--inv-muted) italic @2xl:text-2xl" data-hero style={d(6, step)}>
              {model.subheading}
            </p>
          ) : null}
          <div data-hero style={d(7, step)} className="mt-8">
            <LotusDivider />
          </div>
          <WhenWhere model={model} step={step} className="mt-6 items-center" />
        </div>
      </div>
      {model.coverPhoto ? (
        <div className="relative mx-auto mt-12 aspect-[4/5] w-full max-w-sm overflow-hidden rounded-t-full" data-reveal="mask">
          <ParallaxImage photo={model.coverPhoto} alt={model.coverPhoto.alt || `Portrait of ${model.title}`} sizes="(min-width: 640px) 384px, 90vw" depth={0.6} eager={model.eager} />
        </div>
      ) : null}
      <Bouquet className="cine-float absolute -bottom-8 -left-16 w-48 opacity-90 @2xl:w-64" seed={5} />
      <Bouquet className="cine-float-slow absolute -right-16 -bottom-10 w-52 opacity-90 @2xl:w-72" seed={19} flip />
    </section>
  );
}

function FramedHero({ model, step, contrast }: { model: CinematicModel; step: number; contrast: boolean }) {
  return (
    <section className={cn("relative isolate overflow-hidden px-5 py-16 @2xl:px-10 @2xl:py-24", contrast && "cine-contrast")} aria-labelledby="cine-names">
      <PaperGrain opacity={0.14} />
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 @5xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative px-6 py-14 @2xl:px-12 @2xl:py-20">
          <FineFrame className="absolute inset-0 h-full w-full" />
          <div className="relative flex flex-col items-start text-left">
            <Blessing model={model} step={step} />
            {model.headline ? (
              <Eyebrow className="mt-8">
                <span data-hero style={d(3, step)} className="block">
                  {model.headline}
                </span>
              </Eyebrow>
            ) : null}
            <h1 id="cine-names" className="inv-display mt-6 text-[clamp(3.1rem,11cqw,6.5rem)] leading-[0.92]" data-hero="mask" style={d(4, step)}>
              <DisplayNames title={model.title} stacked className="items-start" />
            </h1>
            {model.subheading ? (
              <p className="mt-6 max-w-md text-lg text-(--inv-muted)" data-hero style={d(6, step)}>
                {model.subheading}
              </p>
            ) : null}
            {model.hosts ? (
              <p className="mt-3 max-w-md text-sm text-(--inv-muted) italic" data-hero style={d(6, step)}>
                {model.hosts}
              </p>
            ) : null}
            <span className="mt-8 h-px w-24 bg-(--inv-accent)" data-hero style={d(7, step)} />
            <WhenWhere model={model} step={step} className="mt-6 items-start" />
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm" data-hero style={d(5, step)}>
          {model.coverPhoto ? (
            <div className="relative aspect-[3/4] overflow-hidden border border-(--inv-accent)/60 p-2">
              <div className="relative h-full w-full overflow-hidden">
                <Image src={model.coverPhoto.url} alt={model.coverPhoto.alt || `Portrait of ${model.title}`} fill sizes="(min-width: 1024px) 384px, 90vw" className="object-cover" data-parallax="0.5" priority={model.eager} loading={model.eager ? undefined : "lazy"} />
              </div>
            </div>
          ) : (
            <div className="relative aspect-[3/4]">
              <Sprig className="absolute inset-y-0 left-1/2 h-full -translate-x-1/2 opacity-80" leaves={9} />
              <Bouquet className="cine-float absolute right-0 bottom-0 w-2/3" seed={31} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EditorialHero({ model, step, contrast }: { model: CinematicModel; step: number; contrast: boolean }) {
  return (
    <section className={cn("relative isolate overflow-hidden px-5 py-14 @2xl:px-10 @2xl:py-20", contrast && "cine-contrast")} aria-labelledby="cine-names">
      <PaperGrain opacity={0.08} />
      <div className="relative mx-auto grid w-full max-w-6xl items-end gap-10 @5xl:grid-cols-[0.9fr_1.1fr]">
        <div className="relative order-2 @5xl:order-1" data-hero style={d(2, step)}>
          <div className="relative ml-auto aspect-[4/5] w-[88%] overflow-hidden rounded-[45%_45%_0_0/30%_30%_0_0] bg-(--inv-surface)">
            {model.coverPhoto ? (
              <Image src={model.coverPhoto.url} alt={model.coverPhoto.alt || `Portrait of ${model.title}`} fill sizes="(min-width: 1024px) 480px, 88vw" className="object-cover" data-parallax="0.6" priority={model.eager} loading={model.eager ? undefined : "lazy"} />
            ) : (
              <Bouquet className="absolute inset-0 m-auto w-4/5" seed={41} />
            )}
          </div>
          <div className="absolute -bottom-6 left-0 w-[46%] border border-(--inv-border) bg-(--inv-bg) p-4 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.4)]" data-hero style={d(7, step)}>
            <p className="text-[0.62rem] tracking-[0.3em] text-(--inv-accent-ink) uppercase">{model.ceremonyLabel}</p>
            <p className="inv-display mt-1 text-lg leading-tight">{model.weekdayDateLabel}</p>
            <p className="mt-1 text-xs text-(--inv-muted)">{model.timeLabel}</p>
          </div>
          <Sprig className="absolute -top-6 -left-4 h-40 opacity-70" />
        </div>
        <div className="relative order-1 flex flex-col items-start @5xl:order-2 @5xl:pb-16">
          <Blessing model={model} step={step} />
          {model.headline ? (
            <Eyebrow className="mt-8">
              <span data-hero style={d(3, step)} className="block">
                {model.headline}
              </span>
            </Eyebrow>
          ) : null}
          <h1 id="cine-names" className="inv-display mt-5 text-[clamp(3.2rem,12cqw,7rem)] leading-[0.9] tracking-tight" data-hero="mask" style={d(4, step)}>
            <DisplayNames title={model.title} stacked className="items-start" />
          </h1>
          {model.subheading ? (
            <p className="inv-script mt-4 text-3xl text-(--inv-accent-ink) @2xl:text-4xl" data-hero style={d(6, step)}>
              {model.subheading}
            </p>
          ) : null}
          {model.hosts ? (
            <p className="mt-4 max-w-sm text-sm text-(--inv-muted)" data-hero style={d(6, step)}>
              {model.hosts}
            </p>
          ) : null}
          {model.placeLabel ? (
            <p className="mt-8 text-[0.7rem] tracking-[0.3em] uppercase" data-hero style={d(8, step)}>
              {model.placeLabel}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

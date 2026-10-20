"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { isFullPage, type RenderMode } from "@/features/templates/types";
import type { ArtDirection } from "@/features/templates/cinematic/art-direction";
import { Bouquet, Sprig } from "@/features/templates/cinematic/art/botanicals";
import { PaperGrain, WaxSeal } from "@/features/templates/cinematic/art/ornaments";
import { rememberOpened } from "@/features/templates/cinematic/motion/motion-root";
import { ParticleBurst } from "@/features/templates/cinematic/motion/particles";
import { MOTION_PRESETS } from "@/features/templates/cinematic/motion/presets";
import { useStage } from "@/features/templates/cinematic/motion/stage";

export interface CoverText {
  invocation: string;
  regionalTitle: string;
  title: string;
  monogram: string;
  dateLabel: string;
  placeLabel: string;
}

interface OpeningCoverProps {
  art: ArtDirection;
  text: CoverText;
  slug: string;
  mode: RenderMode;
}

/**
 * The first screen: an invitation, not a hero. Opens with a click, Enter,
 * Space or the "Skip" link; Escape skips too. Never traps the guest: skipping
 * is always one action away and the cover removes itself after opening.
 */
export function OpeningCover({ art, text, slug, mode }: OpeningCoverProps) {
  const { stage, setStage, capabilities, animated } = useStage();
  const coverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [burst, setBurst] = useState(false);
  const titleId = useId();

  const finish = useCallback(() => {
    if (mode === "public") rememberOpened(slug);
    setStage("open");
    // Move focus to the start of the invitation for keyboard and screen-reader users.
    window.requestAnimationFrame(() => document.getElementById(`cine-start-${slug}`)?.focus({ preventScroll: !isFullPage(mode) }));
  }, [mode, setStage, slug]);

  const open = useCallback(() => {
    if (stage !== "cover") return;
    const cover = coverRef.current;
    if (!cover || !animated || capabilities.reduced) {
      setStage("opening");
      window.setTimeout(finish, capabilities.reduced ? 220 : 0);
      return;
    }
    setStage("opening");
    import("@/lib/animation/gsap").then(({ gsap }) => {
      import("@/features/templates/cinematic/motion/opening-timelines").then(({ buildOpeningTimeline }) => {
        const tl = buildOpeningTimeline(gsap, cover, art.opening.style, MOTION_PRESETS[art.motion].openingSpeed, () => {
          if (!capabilities.lite) setBurst(true);
        });
        tl.eventCallback("onComplete", finish);
      });
    });
  }, [stage, animated, capabilities.reduced, capabilities.lite, art.opening.style, art.motion, setStage, finish]);

  const skip = useCallback(() => {
    if (stage === "open") return;
    finish();
  }, [stage, finish]);

  useEffect(() => {
    if (stage === "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, skip]);

  // Public page: focus the open button so keyboard users can press Enter immediately.
  useEffect(() => {
    if (isFullPage(mode) && stage === "cover") buttonRef.current?.focus({ preventScroll: true });
  }, [mode, stage]);

  if (stage === "open") return burst ? <div className={cn(isFullPage(mode) ? "fixed" : "absolute", "inset-0 z-[70] pointer-events-none")}><ParticleBurst style={art.opening.particles} active /></div> : null;

  const style = art.opening.style;

  return (
    <div
      ref={coverRef}
      data-cinematic-cover
      role="dialog"
      aria-modal={isFullPage(mode) ? true : undefined}
      aria-labelledby={titleId}
      className={cn(
        "inset-x-0 top-0 z-[70] flex items-center justify-center overflow-hidden",
        isFullPage(mode) ? "fixed inset-0 h-[100svh]" : "absolute h-[100cqh] min-h-[560px]",
        stage === "opening" && capabilities.reduced && "cine-cover-fade",
      )}
      style={{ perspective: 1400 }}
    >
      <div data-cover-part="backdrop" className="absolute inset-0 bg-(--inv-bg)">
        <PaperGrain opacity={0.09} />
        <Bouquet className="cine-float absolute -top-6 -left-10 w-44 @2xl:w-72" seed={11} />
        <Bouquet className="cine-float-slow absolute -right-10 -bottom-6 w-48 rotate-180 @2xl:w-80" seed={23} flip />
        <Sprig className="absolute top-1/3 right-3 hidden h-64 opacity-60 @2xl:block" />
      </div>

      <ParticleBurst style={art.opening.particles} active={burst} />

      {style === "gatefold" ? (
        <div data-cover-part="doors" className="absolute inset-0 flex" style={{ transformStyle: "preserve-3d" }}>
          {(["left", "right"] as const).map((side) => (
            <div
              key={side}
              data-cover-part={`door-${side}`}
              className={cn("relative h-full w-1/2 overflow-hidden bg-(--inv-contrast-bg)", side === "left" ? "border-r border-(--inv-accent)/60" : "border-l border-(--inv-accent)/60")}
              style={{ backfaceVisibility: "hidden" }}
            >
              <PaperGrain opacity={0.12} />
              <div className={cn("absolute inset-y-6 border-y border-(--inv-accent)/50", side === "left" ? "right-0 left-6 border-l" : "right-6 left-0 border-r")} />
              <Sprig className={cn("absolute bottom-6 h-56 opacity-70", side === "left" ? "left-6" : "right-6 -scale-x-100")} />
            </div>
          ))}
        </div>
      ) : null}

      <div className="relative z-[3] flex w-full max-w-md flex-col items-center px-6 text-center">
        <CoverHeading text={text} titleId={titleId} onContrast={style === "gatefold"} />

        {style === "envelope" ? (
          <div data-cover-part="envelope" className="relative mt-8 aspect-[7/5] w-[min(84cqw,22rem)]" style={{ transformStyle: "preserve-3d" }}>
            <div data-cover-part="card" className="absolute inset-x-[7%] top-[8%] bottom-[10%] flex flex-col items-center justify-center rounded-[2px] bg-(--inv-surface) shadow-[0_8px_30px_-12px_rgb(0_0_0/0.35)]">
              <span className="inv-script text-3xl text-(--inv-accent-ink)">{text.monogram}</span>
              <span className="mt-1 text-[0.6rem] tracking-[0.3em] text-(--inv-muted) uppercase">{text.dateLabel}</span>
            </div>
            {/* Envelope body: pockets drawn as one SVG so edges stay crisp at any size. */}
            <svg viewBox="0 0 350 250" preserveAspectRatio="none" className="absolute inset-0 h-full w-full drop-shadow-[0_24px_40px_rgb(40_38_34/0.18)]" aria-hidden>
              <rect x="0.5" y="0.5" width="349" height="249" rx="3" fill="color-mix(in oklab, var(--inv-surface) 84%, var(--inv-accent))" stroke="var(--inv-accent)" strokeOpacity="0.55" />
              <path d="M0.5 249.5 L175 120 L349.5 249.5Z" fill="color-mix(in oklab, var(--inv-surface) 74%, var(--inv-accent))" stroke="var(--inv-accent)" strokeOpacity="0.55" />
              <path d="M0.5 0.5 L150 140 M349.5 0.5 L200 140" stroke="var(--inv-accent)" strokeOpacity="0.4" fill="none" />
              <rect x="10" y="10" width="330" height="230" rx="2" fill="none" stroke="var(--inv-accent)" strokeOpacity="0.35" strokeDasharray="1 3" />
            </svg>
            <div data-cover-part="flap" className="absolute inset-x-0 top-0 h-[56%]" style={{ transformOrigin: "50% 0%", backfaceVisibility: "hidden" }}>
              <svg viewBox="0 0 350 140" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
                <defs>
                  <pattern id="cine-liner" width="14" height="14" patternUnits="userSpaceOnUse">
                    <circle cx="7" cy="7" r="1.1" fill="var(--inv-accent)" fillOpacity="0.45" />
                  </pattern>
                </defs>
                <path d="M0.5 0.5 H349.5 L175 139Z" fill="color-mix(in oklab, var(--inv-surface) 78%, var(--inv-accent))" stroke="var(--inv-accent)" strokeOpacity="0.6" />
                <path d="M24 0.5 H326 L175 118Z" fill="url(#cine-liner)" />
              </svg>
            </div>
            <div data-cover-part="seal" className="absolute top-[56%] left-1/2 w-16 -translate-x-1/2 -translate-y-1/2 @2xl:w-20">
              <WaxSeal monogram={text.monogram} />
            </div>
          </div>
        ) : null}

        {style === "layered-card" ? (
          <div className="relative mt-8 aspect-[4/5] w-[min(70cqw,17rem)]">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                data-cover-part="layer"
                className="absolute inset-0 rounded-[3px] border border-(--inv-border) bg-(--inv-surface) shadow-[0_10px_30px_-14px_rgb(0_0_0/0.35)]"
                style={{ transform: `rotate(${[-2.5, 2, 0][i]}deg)`, zIndex: i }}
              >
                {i === 2 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-6">
                    <span className="inv-script text-4xl text-(--inv-accent-ink)">{text.monogram}</span>
                    <span className="h-px w-12 bg-(--inv-accent)" />
                    <span className="text-[0.6rem] tracking-[0.3em] text-(--inv-muted) uppercase">{text.dateLabel}</span>
                  </div>
                ) : null}
              </div>
            ))}
            <div data-cover-part="seal" className="absolute -bottom-6 left-1/2 z-10 w-14 -translate-x-1/2">
              <WaxSeal monogram={text.monogram} />
            </div>
          </div>
        ) : null}

        {style === "gatefold" ? (
          <div data-cover-part="seal" className="mt-8 w-20">
            <WaxSeal monogram={text.monogram} />
          </div>
        ) : null}

        <div data-cover-part="prompt" className="mt-10 flex flex-col items-center gap-3">
          <button
            ref={buttonRef}
            type="button"
            onClick={open}
            className={cn(
              "cine-open-button group inline-flex min-h-12 items-center gap-3 rounded-full border px-7 text-[0.72rem] font-medium tracking-[0.28em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4",
              style === "gatefold"
                ? "border-(--inv-accent) text-(--inv-contrast-text) hover:bg-(--inv-accent) hover:text-(--inv-contrast-bg) focus-visible:outline-(--inv-accent)"
                : "border-(--inv-accent) text-(--inv-text) hover:bg-(--inv-accent) hover:text-(--inv-accent-contrast) focus-visible:outline-(--inv-accent)",
            )}
            data-testid="open-invitation"
          >
            <span className="cine-pulse size-1.5 rounded-full bg-(--inv-accent)" aria-hidden />
            {art.opening.prompt}
          </button>
          <button type="button" onClick={skip} className={cn("text-xs underline-offset-4 hover:underline", style === "gatefold" ? "text-(--inv-contrast-muted)" : "text-(--inv-muted)")} data-testid="skip-opening">
            Skip to invitation
          </button>
        </div>
      </div>
    </div>
  );
}

function CoverHeading({ text, titleId, onContrast }: { text: CoverText; titleId: string; onContrast: boolean }) {
  return (
    <div className={cn("flex flex-col items-center", onContrast ? "text-(--inv-contrast-text)" : "text-(--inv-text)")}>
      {text.invocation ? <p className={cn("inv-indic text-sm", onContrast ? "text-(--inv-contrast-accent-ink)" : "text-(--inv-accent-ink)")}>{text.invocation}</p> : null}
      {text.regionalTitle ? <p className={cn("inv-indic mt-2 text-lg", onContrast ? "text-(--inv-contrast-muted)" : "text-(--inv-muted)")}>{text.regionalTitle}</p> : null}
      <h2 id={titleId} className="inv-display mt-4 text-4xl leading-tight text-balance @2xl:text-5xl">
        {text.title}
      </h2>
      <p className={cn("mt-3 text-[0.7rem] tracking-[0.3em] uppercase", onContrast ? "text-(--inv-contrast-muted)" : "text-(--inv-muted)")}>
        {text.dateLabel}
        {text.placeLabel ? ` · ${text.placeLabel}` : ""}
      </p>
    </div>
  );
}

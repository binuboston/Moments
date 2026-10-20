import { Bouquet } from "@/features/templates/cinematic/art/botanicals";
import type { CinematicModel } from "@/features/templates/cinematic/model";
import { CineSection, Eyebrow } from "@/features/templates/cinematic/sections/common";
import { ParallaxImage } from "@/features/templates/cinematic/sections/parallax-image";

export function Introduction({ model, contrast }: { model: CinematicModel; contrast: boolean }) {
  const photo = model.gallery[0] ?? null;
  if (!model.intro && model.familyLines.length === 0 && !model.hosts) return null;
  return (
    <CineSection contrast={contrast} aria-labelledby="cine-intro">
      <div className="mx-auto grid max-w-6xl items-center gap-14 @5xl:grid-cols-[1fr_1fr]">
        <div className="flex flex-col items-start" data-reveal="up">
          <Eyebrow>Our celebration</Eyebrow>
          <h2 id="cine-intro" className="inv-display mt-5 text-4xl leading-[1.08] text-balance @2xl:text-5xl">
            {model.intro ? <span className="block">{model.intro}</span> : <span className="block">Join us as we begin our forever.</span>}
          </h2>
          {model.familyLines.length > 0 ? (
            <ul className="mt-8 space-y-2 border-l border-(--inv-accent)/60 pl-5 text-sm text-(--inv-muted)">
              {model.familyLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
          {model.hosts ? <p className="mt-6 text-sm text-(--inv-muted) italic">{model.hosts}</p> : null}
        </div>
        <div className="relative mx-auto w-full max-w-md">
          {photo ? (
            <div className="relative aspect-[4/5] overflow-hidden" data-reveal="mask">
              <ParallaxImage photo={photo} alt={photo.alt || `Photograph of ${model.title}`} sizes="(min-width: 1024px) 448px, 90vw" />
            </div>
          ) : (
            <Bouquet className="cine-float mx-auto w-4/5" seed={53} />
          )}
          <span className="absolute -bottom-4 -left-4 h-24 w-24 border-b border-l border-(--inv-accent)/70" aria-hidden />
          <span className="absolute -top-4 -right-4 h-24 w-24 border-t border-r border-(--inv-accent)/70" aria-hidden />
        </div>
      </div>
    </CineSection>
  );
}

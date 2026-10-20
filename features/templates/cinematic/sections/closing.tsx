import Image from "next/image";
import type { RenderMode } from "@/features/templates/types";
import type { ArtDirection } from "@/features/templates/cinematic/art-direction";
import { Bouquet } from "@/features/templates/cinematic/art/botanicals";
import { LotusDivider, PaperGrain } from "@/features/templates/cinematic/art/ornaments";
import type { CinematicModel } from "@/features/templates/cinematic/model";
import { DisplayNames, Eyebrow } from "@/features/templates/cinematic/sections/common";
import { ShareActions } from "@/features/templates/cinematic/sections/share-actions";

export function Closing({ model, art, mode, showMessage, contrast }: { model: CinematicModel; art: ArtDirection; mode: RenderMode; showMessage: boolean; contrast: boolean }) {
  const photo = art.layouts.closing === "photo" ? (model.gallery[model.gallery.length - 1] ?? model.coverPhoto) : null;
  const blessing = showMessage ? model.message : "";
  return (
    <section className={`relative isolate overflow-hidden px-6 py-24 text-center @2xl:py-32 ${photo ? "cine-on-photo" : ""} ${contrast && !photo ? "cine-contrast" : ""}`} aria-labelledby="cine-closing">
      {photo ? (
        <>
          <Image src={photo.url} alt="" fill sizes="100vw" className="-z-10 object-cover" loading="lazy" data-parallax="0.8" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/55 to-black/70" />
        </>
      ) : (
        <>
          <PaperGrain opacity={0.08} />
          <Bouquet className="cine-float absolute -top-12 -left-16 w-56 opacity-80 @2xl:w-72" seed={61} />
          <Bouquet className="cine-float-slow absolute -right-16 -bottom-12 w-60 rotate-180 opacity-80 @2xl:w-80" seed={67} flip />
        </>
      )}
      <div className="relative mx-auto flex max-w-2xl flex-col items-center" data-reveal="up">
        <Eyebrow>With love and blessings</Eyebrow>
        {blessing ? <p className="inv-display mt-8 text-3xl leading-snug text-balance @2xl:text-4xl">{blessing}</p> : null}
        {model.familyMessage ? <p className="mt-6 max-w-lg leading-relaxed text-(--inv-muted)">{model.familyMessage}</p> : null}
        <div className="mt-10">
          <LotusDivider className={photo ? "text-(--inv-accent-ink)" : undefined} />
        </div>
        <h2 id="cine-closing" className="inv-display mt-8 text-5xl leading-none @2xl:text-6xl">
          <DisplayNames title={model.title} />
        </h2>
        <p className="mt-6 text-[0.7rem] tracking-[0.32em] text-(--inv-muted) uppercase">{model.numericDateLabel}</p>
        <div className="mt-12">
          <ShareActions hashtag={model.hashtag} title={model.shareTitle} text={model.shareText} url={model.publicUrl} mode={mode} />
        </div>
      </div>
    </section>
  );
}

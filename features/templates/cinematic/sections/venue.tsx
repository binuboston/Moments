import { NavigationIcon } from "lucide-react";
import { QrCode } from "@/features/templates/cinematic/art/qr-code";
import type { CinematicModel } from "@/features/templates/cinematic/model";
import { CineSection, SectionHeading } from "@/features/templates/cinematic/sections/common";
import { MapEmbed } from "@/features/templates/cinematic/sections/map-embed";

export function Venue({ model, contrast }: { model: CinematicModel; contrast: boolean }) {
  if (!model.venueName && !model.address) return null;
  const query = [model.venueName, model.address, model.city].filter(Boolean).join(", ");
  return (
    <CineSection contrast={contrast} id="venue" aria-labelledby="cine-venue">
      <div className="mx-auto max-w-5xl">
        <SectionHeading id="cine-venue" eyebrow="The venue" title={model.venueName || "Where we celebrate"} />
        <div className="grid items-start gap-12 @3xl:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-6" data-reveal="up">
            <dl className="grid gap-6 text-base">
              {model.address || model.city ? (
                <div>
                  <dt className="text-[0.65rem] tracking-[0.3em] text-(--inv-accent-ink) uppercase">Address</dt>
                  <dd className="mt-2 leading-relaxed whitespace-pre-line">{[model.address, model.city].filter(Boolean).join("\n")}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[0.65rem] tracking-[0.3em] text-(--inv-accent-ink) uppercase">{model.ceremonyLabel}</dt>
                <dd className="mt-2">
                  {model.weekdayDateLabel} · {model.timeLabel}
                </dd>
              </div>
              {model.dressCode ? (
                <div>
                  <dt className="text-[0.65rem] tracking-[0.3em] text-(--inv-accent-ink) uppercase">Attire</dt>
                  <dd className="mt-2">{model.dressCode}</dd>
                </div>
              ) : null}
            </dl>
            <div className="flex flex-wrap gap-3">
              {model.directionsUrl ? (
                <a href={model.directionsUrl} target="_blank" rel="noopener noreferrer" className="cine-button" data-testid="directions">
                  <NavigationIcon className="size-4" aria-hidden /> Get directions
                </a>
              ) : null}
              <MapEmbed query={query} title={`Map of ${model.venueName || "the venue"}`} />
            </div>
          </div>
          {model.directionsUrl ? (
            <figure className="mx-auto flex w-48 flex-col items-center gap-3 @3xl:ml-auto" data-reveal="up" style={{ "--reveal-delay": "200ms" } as React.CSSProperties}>
              <div className="border border-(--inv-accent)/60 bg-white p-3">
                <QrCode value={model.directionsUrl} label={`QR code for directions to ${model.venueName || "the venue"}`} className="size-36" />
              </div>
              <figcaption className="text-center text-[0.65rem] tracking-[0.24em] text-(--inv-muted) uppercase">Scan for directions</figcaption>
            </figure>
          ) : null}
        </div>
      </div>
    </CineSection>
  );
}

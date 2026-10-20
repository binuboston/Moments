import type { InvitationFunction } from "@/lib/validation/functions";
import { formatEventDate } from "@/lib/utils/dates";
import { timeLabel } from "@/features/templates/cinematic/model";
import { CineSection, SectionHeading } from "@/features/templates/cinematic/sections/common";

export function CineSchedule({ functions, contrast }: { functions: InvitationFunction[]; contrast: boolean }) {
  if (functions.length === 0) return null;
  const sorted = [...functions].sort((a, b) => a.sortOrder - b.sortOrder || a.startsAt.localeCompare(b.startsAt));
  return (
    <CineSection contrast={contrast} id="schedule" aria-labelledby="cine-schedule">
      <div className="mx-auto max-w-3xl">
        <SectionHeading id="cine-schedule" eyebrow="The celebrations" title="Order of ceremonies" />
        <ol className="relative">
          <span className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-(--inv-accent)/60 @2xl:left-1/2" data-reveal="line-y" aria-hidden />
          {sorted.map((fn, i) => (
            <li key={fn.id ?? `${fn.name}-${i}`} className="relative grid gap-2 pb-12 pl-10 last:pb-0 @2xl:grid-cols-2 @2xl:gap-12 @2xl:pl-0" data-reveal="up">
              <span className="absolute top-2 left-0 size-[15px] rotate-45 border border-(--inv-accent) bg-(--inv-bg) @2xl:left-1/2 @2xl:-translate-x-1/2" aria-hidden />
              <div className={i % 2 === 0 ? "@2xl:pr-12 @2xl:text-right" : "@2xl:order-2 @2xl:pl-12"}>
                <p className="text-[0.65rem] tracking-[0.3em] text-(--inv-accent-ink) uppercase">{formatEventDate(fn.startsAt, fn.timezone)}</p>
                <p className="mt-1 text-sm text-(--inv-muted)">{timeLabel(fn.startsAt, fn.timezone)}</p>
              </div>
              <div className={i % 2 === 0 ? "@2xl:pl-12" : "@2xl:order-1 @2xl:pr-12 @2xl:text-right"}>
                <h3 className="inv-display text-3xl leading-tight">{fn.name}</h3>
                {fn.venueName || fn.address ? <p className="mt-2 text-sm text-(--inv-muted)">{[fn.venueName, fn.address].filter(Boolean).join(" · ")}</p> : null}
                {fn.dressCode ? <p className="mt-1 text-sm text-(--inv-muted) italic">Attire: {fn.dressCode}</p> : null}
                {fn.description ? <p className="mt-3 text-sm leading-relaxed">{fn.description}</p> : null}
                {fn.mapsUrl ? (
                  <a href={fn.mapsUrl} target="_blank" rel="noopener noreferrer" className="cine-link mt-3 inline-block text-sm">
                    Directions
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </CineSection>
  );
}

import { cn } from "@/lib/utils/cn";
import type { ArtDirection } from "@/features/templates/cinematic/art-direction";
import type { CinematicModel } from "@/features/templates/cinematic/model";
import { CalendarButtons } from "@/features/templates/cinematic/sections/calendar-buttons";
import { CineSection, Eyebrow } from "@/features/templates/cinematic/sections/common";

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

function MonthGrid({ model }: { model: CinematicModel }) {
  const { firstWeekday, daysInMonth, day, monthName, year } = model.date;
  const cells: (number | null)[] = [...Array.from({ length: firstWeekday }, () => null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  return (
    <figure className="w-full max-w-xs" data-reveal="up" style={{ "--reveal-delay": "200ms" } as React.CSSProperties}>
      <figcaption className="mb-4 flex items-baseline justify-between text-[0.68rem] tracking-[0.3em] text-(--inv-muted) uppercase">
        <span>{monthName}</span>
        <span>{year}</span>
      </figcaption>
      <table className="w-full table-fixed text-center text-sm" aria-label={`${monthName} ${year} calendar with the wedding day marked`}>
        <thead>
          <tr>
            {WEEK.map((w, i) => (
              <th key={i} scope="col" className="pb-2 text-[0.62rem] font-medium text-(--inv-muted)">
                <span aria-hidden>{w}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(cells.length / 7) }, (_, row) => (
            <tr key={row}>
              {cells.slice(row * 7, row * 7 + 7).map((n, i) => (
                <td key={i} className="relative h-9">
                  {n === day ? (
                    <span className="relative inline-flex size-9 items-center justify-center font-semibold text-(--inv-text)" aria-current="date">
                      <svg viewBox="0 0 40 40" className="absolute inset-0 size-9 text-(--inv-accent-ink)" aria-hidden data-reveal="draw" style={{ "--reveal-delay": "700ms" } as React.CSSProperties}>
                        <path d="M20 3 C 31 3 37 10 37 20 C 37 31 29 37 19 37 C 9 37 3 30 3 20 C 3 10 10 4 22 2" fill="none" stroke="currentColor" strokeWidth={1.4} pathLength={1} />
                      </svg>
                      <span className="relative">{n}</span>
                    </span>
                  ) : (
                    <span className={cn("text-(--inv-muted)", n === null && "invisible")}>{n ?? "·"}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

export function SaveTheDate({ model, art, contrast }: { model: CinematicModel; art: ArtDirection; contrast: boolean }) {
  const location = [model.venueName, model.address, model.city].filter(Boolean).join(", ");
  const buttons = (
    <CalendarButtons slug={model.slug} title={model.shareTitle} startsAt={model.startsAt} endsAt={model.endsAt} location={location} details={model.intro} url={model.publicUrl} className="mt-10" />
  );

  if (art.layouts.saveTheDate === "monumental") {
    return (
      <CineSection contrast={contrast} id="save-the-date" aria-labelledby="cine-std">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <Eyebrow>Save the date</Eyebrow>
          <h2 id="cine-std" className="sr-only">
            Save the date: {model.weekdayDateLabel}
          </h2>
          <p className="mt-8 text-[0.72rem] tracking-[0.4em] uppercase" data-reveal="up">
            {model.date.weekday}
          </p>
          <p className="inv-display mt-4 text-[clamp(3.4rem,15cqw,9rem)] leading-none tracking-tight" data-reveal="mask" aria-hidden>
            <span className="block">{model.numericDateLabel}</span>
          </p>
          <span className="mt-8 h-px w-32 bg-(--inv-accent)" data-reveal="line" />
          <p className="mt-8 text-lg" data-reveal="up">
            {model.ceremonyLabel} · {model.timeLabel}
          </p>
          {model.placeLabel ? (
            <p className="mt-2 text-(--inv-muted)" data-reveal="up">
              {model.placeLabel}
            </p>
          ) : null}
          {buttons}
        </div>
      </CineSection>
    );
  }

  return (
    <CineSection contrast={contrast} id="save-the-date" aria-labelledby="cine-std">
      <div className="mx-auto grid max-w-5xl items-center gap-14 @3xl:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col items-start" data-reveal="up">
          <Eyebrow>Save the date</Eyebrow>
          <h2 id="cine-std" className="mt-6 flex flex-col">
            <span className="text-[0.75rem] tracking-[0.4em] text-(--inv-muted) uppercase">{model.date.weekday}</span>
            <span className="inv-display mt-2 flex items-end gap-4 leading-none">
              <span className="text-[clamp(5rem,20cqw,9.5rem)]">{model.date.day}</span>
              <span className="mb-3 flex flex-col text-left text-2xl leading-tight @2xl:text-3xl">
                <span>{model.date.monthName}</span>
                <span className="text-(--inv-muted)">{model.date.year}</span>
              </span>
            </span>
          </h2>
          <span className="mt-8 h-px w-40 bg-(--inv-accent)" data-reveal="line" />
          <dl className="mt-8 grid gap-4 text-sm @2xl:grid-cols-2">
            <div>
              <dt className="text-[0.65rem] tracking-[0.3em] text-(--inv-accent-ink) uppercase">{model.ceremonyLabel}</dt>
              <dd className="mt-1 text-base">{model.timeLabel}</dd>
            </div>
            {model.placeLabel ? (
              <div>
                <dt className="text-[0.65rem] tracking-[0.3em] text-(--inv-accent-ink) uppercase">Venue</dt>
                <dd className="mt-1 text-base">{model.placeLabel}</dd>
              </div>
            ) : null}
          </dl>
          {buttons}
        </div>
        <div className="flex justify-center @3xl:justify-end">
          <MonthGrid model={model} />
        </div>
      </div>
    </CineSection>
  );
}

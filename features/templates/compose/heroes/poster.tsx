import { formatTimeRange, monthGrid } from "@/lib/utils/dates";
import { HeroTitle, Invocation, kindDetails } from "@/features/templates/designs/shared";
import type { TemplateProps } from "@/features/templates/types";

/**
 * Poster: monochrome editorial. A giant day numeral with the month and
 * weekday set beside it, a heavy title and a ruled footer line with time and
 * venue. Typography is the whole design.
 */
export function PosterHero({ view }: TemplateProps) {
  const { content } = view;
  const details = kindDetails(view);
  const date = monthGrid(content.startsAt, content.timezone);
  return (
    <header data-inv-exit className="px-6 pt-10 sm:px-10 sm:pt-14">
      <Invocation view={view} />
      <div className="flex items-baseline justify-between gap-4 border-b-2 border-(--inv-text) pb-3 text-[0.7rem] font-bold tracking-[0.24em] uppercase" data-inv-hero>
        <span>{details.eyebrow}</span>
        <span className="text-(--inv-accent)">{date?.year}</span>
      </div>
      {date ? (
        <div className="mt-6 flex items-end gap-4 sm:gap-6" data-inv-hero aria-hidden>
          <span className="inv-display text-[clamp(7rem,34vw,13rem)] leading-[0.78] font-black tracking-[-0.06em] tabular-nums">{String(date.day).padStart(2, "0")}</span>
          <span className="pb-2 text-left">
            <span className="block text-2xl leading-none font-black tracking-tight uppercase sm:text-4xl">{date.monthName}</span>
            <span className="mt-2 block text-xs font-semibold tracking-[0.24em] uppercase text-(--inv-muted)">{date.weekday}</span>
          </span>
        </div>
      ) : null}
      <HeroTitle view={view} className="inv-display mt-8 text-[clamp(2.5rem,9vw,5.25rem)] leading-[0.92] font-black tracking-[-0.04em] uppercase text-balance" headlineClassName="text-sm font-bold tracking-[0.18em] uppercase text-(--inv-accent)" />
      {content.subheading ? (
        <p className="mt-5 max-w-md text-lg text-(--inv-muted)" data-inv-hero>
          {content.subheading}
        </p>
      ) : null}
      <p className="mt-10 flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-(--inv-text) pt-3 text-xs font-semibold tracking-[0.18em] uppercase" data-inv-hero>
        <span>{formatTimeRange(content.startsAt, content.endsAt, content.timezone)}</span>
        {content.venue.name ? <span className="text-(--inv-muted)">{content.venue.name}</span> : null}
      </p>
    </header>
  );
}

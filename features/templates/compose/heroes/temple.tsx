import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import { Mandala } from "@/features/templates/art/mandala";
import { MarigoldToran } from "@/features/templates/art/marigold-toran";
import { HeroTitle, Invocation, kindDetails } from "@/features/templates/designs/shared";
import type { TemplateProps } from "@/features/templates/types";

/**
 * Temple: a marigold toran across the top, a kolam mandala drawing itself in
 * behind the names, classical capitals and a diamond-ruled date. Made for
 * Indian ceremonies: weddings, engagements, griha pravesh.
 */
export function TempleHero({ view }: TemplateProps) {
  const { content } = view;
  const details = kindDetails(view);
  return (
    <header data-inv-exit className="relative overflow-hidden px-6 pt-24 pb-16 text-center sm:px-12 sm:pt-28">
      <div className="absolute inset-x-0 top-0 origin-top motion-safe:animate-[toran-sway_6s_ease-in-out_infinite]" data-inv-hero>
        <MarigoldToran />
      </div>
      <div className="pointer-events-none absolute top-28 left-1/2 size-[20rem] -translate-x-1/2 opacity-[0.14] sm:top-32 sm:size-[26rem]" data-inv-speed="0.12">
        <Mandala className="size-full motion-safe:animate-[spin_120s_linear_infinite]" />
      </div>
      <div className="relative">
        <Invocation view={view} className="text-base font-medium sm:text-lg" />
        <p className="text-[0.72rem] tracking-[0.34em] uppercase text-(--inv-accent)" data-inv-hero>
          {details.eyebrow}
        </p>
        <HeroTitle view={view} className="inv-display mt-6 text-5xl leading-[1.08] text-balance sm:text-7xl" headlineClassName="inv-display tracking-[0.06em] text-(--inv-muted)" />
        {content.hosts ? (
          <p className="mx-auto mt-5 max-w-md text-sm italic text-(--inv-muted) text-pretty" data-inv-hero>
            {content.hosts}
          </p>
        ) : null}
        {content.subheading ? (
          <p className="inv-display mt-4 text-xl text-(--inv-muted)" data-inv-hero>
            {content.subheading}
          </p>
        ) : null}
        <div className="mx-auto mt-10 flex max-w-md items-center justify-center gap-3 text-(--inv-accent)" aria-hidden data-inv-reveal="draw">
          <span className="h-px flex-1 origin-right bg-current opacity-50" data-line />
          <span className="size-2 rotate-45 bg-current" />
          <span className="size-1.5 rotate-45 border border-current" />
          <span className="size-2 rotate-45 bg-current" />
          <span className="h-px flex-1 origin-left bg-current opacity-50" data-line />
        </div>
        <p className="mt-6 text-sm tracking-[0.22em] uppercase sm:text-base" data-inv-hero>
          {formatEventDate(content.startsAt, content.timezone)}
        </p>
        <p className="mt-1 text-sm text-(--inv-muted)" data-inv-hero>
          {formatTimeRange(content.startsAt, content.endsAt, content.timezone)}
          {content.venue.name ? ` · ${content.venue.name}` : ""}
        </p>
      </div>
    </header>
  );
}

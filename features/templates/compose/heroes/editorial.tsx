import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import { HeroTitle, Invocation, kindDetails } from "@/features/templates/designs/shared";
import type { TemplateProps } from "@/features/templates/types";

/** Editorial: ruled masthead, oversized grotesk title and a date / time / venue grid. */
export function EditorialHero({ view }: TemplateProps) {
  const { content } = view;
  const details = kindDetails(view);
  const date = formatEventDate(content.startsAt, content.timezone);
  const time = formatTimeRange(content.startsAt, content.endsAt, content.timezone);
  return (
    <header data-inv-exit className="px-6 pt-12 sm:px-10 sm:pt-16">
      <Invocation view={view} />
      <div className="flex items-center justify-between border-b border-(--inv-text) pb-4 text-[0.7rem] font-semibold tracking-[0.2em] uppercase" data-inv-hero>
        <span>{details.eyebrow}</span>
        <span className="text-(--inv-accent)">{formatEventDate(content.startsAt, content.timezone).split(" ").slice(-2).join(" ")}</span>
      </div>
      <HeroTitle view={view} className="inv-display mt-10 text-[clamp(2.75rem,10vw,6rem)] leading-[0.95] font-bold tracking-[-0.03em] text-balance" headlineClassName="text-sm font-semibold tracking-[0.12em] uppercase text-(--inv-accent)" />
      {content.subheading ? (
        <p className="mt-6 max-w-md text-lg text-(--inv-muted)" data-inv-hero>
          {content.subheading}
        </p>
      ) : null}
      <dl className="mt-10 grid gap-6 border-t border-(--inv-border) pt-6 sm:grid-cols-3" data-inv-hero>
        <div>
          <dt className="text-[0.65rem] tracking-[0.2em] uppercase text-(--inv-muted)">Date</dt>
          <dd className="mt-1 font-medium">{date}</dd>
        </div>
        <div>
          <dt className="text-[0.65rem] tracking-[0.2em] uppercase text-(--inv-muted)">Time</dt>
          <dd className="mt-1 font-medium">{time}</dd>
        </div>
        {content.venue.name ? (
          <div>
            <dt className="text-[0.65rem] tracking-[0.2em] uppercase text-(--inv-muted)">Venue</dt>
            <dd className="mt-1 font-medium">{content.venue.name}</dd>
          </div>
        ) : null}
      </dl>
    </header>
  );
}

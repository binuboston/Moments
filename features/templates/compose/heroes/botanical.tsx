import { formatEventDate, formatEventTime } from "@/lib/utils/dates";
import { HeroTitle, Invocation, kindDetails } from "@/features/templates/designs/shared";
import type { TemplateProps } from "@/features/templates/types";

/** Botanical: italic title between hairlines, date and venue beneath. */
export function BotanicalHero({ view }: TemplateProps) {
  const { content } = view;
  const details = kindDetails(view);
  return (
    <header data-inv-exit className="relative px-6 pt-20 pb-14 text-center sm:px-12 sm:pt-28">
      <Invocation view={view} />
      <p className="text-[0.7rem] font-medium tracking-[0.32em] uppercase text-(--inv-accent)" data-inv-hero>
        {details.eyebrow}
      </p>
      <HeroTitle view={view} className="inv-display mt-6 text-5xl leading-[1] italic text-balance sm:text-7xl" headlineClassName="tracking-[0.08em] text-(--inv-muted)" />
      {content.subheading ? (
        <p className="mt-5 text-base tracking-[0.08em] text-(--inv-muted) sm:text-lg" data-inv-hero>
          {content.subheading}
        </p>
      ) : null}
      <div className="mx-auto mt-10 grid max-w-sm grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm" data-inv-hero>
        <span className="h-px bg-(--inv-border)" />
        <span className="tracking-[0.2em] uppercase">{formatEventDate(content.startsAt, content.timezone)}</span>
        <span className="h-px bg-(--inv-border)" />
      </div>
      <p className="mt-3 text-sm text-(--inv-muted)" data-inv-hero>
        {formatEventTime(content.startsAt, content.timezone)}
        {content.venue.name ? ` · ${content.venue.name}` : ""}
      </p>
    </header>
  );
}

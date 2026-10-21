import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import { HeroTitle, Invocation, kindDetails } from "@/features/templates/designs/shared";
import type { TemplateProps } from "@/features/templates/types";

/** Soft: pill badge, rounded title and a frosted date card. */
export function SoftHero({ view }: TemplateProps) {
  const { content } = view;
  const details = kindDetails(view);
  return (
    <header data-inv-exit className="relative px-6 pt-16 pb-12 text-center sm:px-12 sm:pt-24">
      <Invocation view={view} />
      <div data-inv-hero>
        <p className="inline-flex rounded-full bg-(--inv-surface) px-4 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase text-(--inv-accent) shadow-sm">{details.eyebrow}</p>
      </div>
      <HeroTitle view={view} className="inv-display mt-8 text-5xl leading-[1.05] text-balance sm:text-6xl" headlineClassName="font-medium text-(--inv-accent)" />
      {content.subheading ? (
        <p className="mt-4 text-lg text-(--inv-muted)" data-inv-hero>
          {content.subheading}
        </p>
      ) : null}
      <div data-inv-hero className="mx-auto mt-8 inline-flex flex-col rounded-[2rem] bg-(--inv-surface)/80 px-8 py-5 shadow-sm backdrop-blur">
        <span className="text-base font-semibold">{formatEventDate(content.startsAt, content.timezone)}</span>
        <span className="text-sm text-(--inv-muted)">{formatTimeRange(content.startsAt, content.endsAt, content.timezone)}</span>
      </div>
    </header>
  );
}

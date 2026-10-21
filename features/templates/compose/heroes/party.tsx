import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import { BalloonCloud } from "@/features/templates/art/balloons";
import { Wave } from "@/features/templates/art/wave";
import { HeroTitle, Invocation, kindDetails } from "@/features/templates/designs/shared";
import type { TemplateProps } from "@/features/templates/types";

/**
 * Party: a tinted band full of bobbing balloons, a chunky rounded title with
 * a coloured drop shadow, the date on a tilted sticker, and a wavy edge into
 * the page.
 */
export function PartyHero({ view }: TemplateProps) {
  const { content } = view;
  const details = kindDetails(view);
  return (
    <header data-inv-exit className="relative overflow-hidden text-center" style={{ background: "color-mix(in oklab, var(--inv-c2) 22%, var(--inv-bg))" }}>
      <BalloonCloud />
      <div className="relative px-6 pt-20 pb-16 sm:px-12 sm:pt-24">
        <Invocation view={view} className="font-semibold" />
        <div data-inv-hero>
          <span className="inline-flex rounded-full border-2 border-dashed border-(--inv-accent) bg-(--inv-surface) px-4 py-1.5 text-xs font-bold tracking-[0.12em] uppercase text-(--inv-accent)">{details.eyebrow}</span>
        </div>
        <HeroTitle
          view={view}
          className="inv-display mt-7 text-5xl leading-[1] font-bold tracking-tight text-balance [text-shadow:3px_3px_0_var(--inv-c2)] sm:text-7xl"
          headlineClassName="font-semibold text-(--inv-muted)"
        />
        {content.subheading ? (
          <p className="mt-5 text-xl font-medium text-(--inv-muted)" data-inv-hero>
            {content.subheading}
          </p>
        ) : null}
        <div data-inv-hero className="mx-auto mt-10 inline-flex -rotate-2 flex-col gap-1 rounded-[1.75rem] bg-(--inv-surface) px-8 py-5 shadow-[0_8px_0_0_var(--inv-accent)]">
          <span className="text-lg font-bold">{formatEventDate(content.startsAt, content.timezone)}</span>
          <span className="text-sm font-medium text-(--inv-muted)">{formatTimeRange(content.startsAt, content.endsAt, content.timezone)}</span>
        </div>
      </div>
      <Wave className="text-(--inv-bg)" />
    </header>
  );
}

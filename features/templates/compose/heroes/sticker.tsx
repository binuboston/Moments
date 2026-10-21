import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import { Confetti, HeroTitle, Invocation, kindDetails } from "@/features/templates/designs/shared";
import type { TemplateProps } from "@/features/templates/types";

/** Sticker: confetti, a pill badge and a date card with an offset shadow. */
export function StickerHero({ view }: TemplateProps) {
  const { content } = view;
  const details = kindDetails(view);
  return (
    <header data-inv-exit className="relative overflow-hidden px-6 pt-16 pb-14 text-center sm:px-12 sm:pt-24">
      <Confetti />
      <div className="relative">
        <Invocation view={view} className="font-semibold" />
        <div data-inv-hero>
          <span className="inline-flex rounded-full bg-(--inv-accent) px-4 py-1.5 text-xs font-bold tracking-[0.12em] uppercase text-(--inv-accent-contrast)">{details.eyebrow}</span>
        </div>
        <HeroTitle view={view} className="inv-display mt-8 text-5xl leading-[1] font-bold tracking-tight text-balance sm:text-7xl" headlineClassName="font-semibold text-(--inv-muted)" />
        {content.subheading ? (
          <p className="mt-5 text-xl font-medium text-(--inv-muted)" data-inv-hero>
            {content.subheading}
          </p>
        ) : null}
        <div data-inv-hero className="mx-auto mt-10 inline-flex flex-col gap-1 rounded-3xl border-2 border-(--inv-text) bg-(--inv-surface) px-8 py-5 shadow-[6px_6px_0_0_var(--inv-c2)]">
          <span className="text-lg font-bold">{formatEventDate(content.startsAt, content.timezone)}</span>
          <span className="text-sm font-medium text-(--inv-muted)">{formatTimeRange(content.startsAt, content.endsAt, content.timezone)}</span>
        </div>
      </div>
    </header>
  );
}

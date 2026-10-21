import { formatEventDate } from "@/lib/utils/dates";
import { HeroTitle, Invocation, RuleOrnament, kindDetails, monogram } from "@/features/templates/designs/shared";
import type { TemplateProps } from "@/features/templates/types";

/** Classic arch: double arched rules, monogram, hosts, serif title, date and venue. */
export function ArchHero({ view }: TemplateProps) {
  const { content } = view;
  const details = kindDetails(view);
  return (
    <header data-inv-exit className="relative px-6 pt-14 pb-12 text-center sm:px-12 sm:pt-20">
      <div className="pointer-events-none absolute inset-4 rounded-t-[999px] rounded-b-[2rem] border border-(--inv-accent)/40 sm:inset-6" aria-hidden data-inv-hero />
      <div className="pointer-events-none absolute inset-6 rounded-t-[999px] rounded-b-[1.75rem] border border-(--inv-border)/70 sm:inset-8" aria-hidden />
      <div className="relative pt-10 sm:pt-14">
        <Invocation view={view} />
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-(--inv-accent) text-(--inv-accent)" data-inv-hero>
          <span className="inv-display text-xl tracking-[0.15em]">{monogram(view)}</span>
        </div>
        {content.hosts ? (
          <p className="mx-auto max-w-md text-sm italic text-(--inv-muted) text-pretty" data-inv-hero>
            {content.hosts}
          </p>
        ) : null}
        <p className="mt-4 text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-(--inv-accent)" data-inv-hero>
          {details.eyebrow}
        </p>
        <HeroTitle view={view} className="inv-display mt-4 text-5xl leading-[1.05] text-balance sm:text-7xl" headlineClassName="inv-display italic text-xl text-(--inv-muted)" />
        {content.subheading ? (
          <p className="inv-display mt-4 text-xl italic text-(--inv-muted) sm:text-2xl" data-inv-hero>
            {content.subheading}
          </p>
        ) : null}
        <RuleOrnament className="mt-8" />
        <p className="mt-6 text-sm tracking-[0.24em] uppercase sm:text-base" data-inv-hero>
          {formatEventDate(content.startsAt, content.timezone)}
        </p>
        {content.venue.name ? (
          <p className="mt-1 text-sm text-(--inv-muted) italic" data-inv-hero>
            {content.venue.name}
          </p>
        ) : null}
      </div>
    </header>
  );
}

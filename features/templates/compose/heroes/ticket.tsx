import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import { HeroTitle, Invocation, kindDetails, monogram } from "@/features/templates/designs/shared";
import type { TemplateProps } from "@/features/templates/types";

/**
 * Ticket: a formal, left-aligned masthead with the organiser, a confident
 * title and an admission ticket (date, time, venue, with a perforated stub).
 * For conferences, launches, galas and award nights.
 */
export function TicketHero({ view }: TemplateProps) {
  const { content } = view;
  const details = kindDetails(view);
  const rows = [
    { label: "Date", value: formatEventDate(content.startsAt, content.timezone) },
    { label: "Time", value: formatTimeRange(content.startsAt, content.endsAt, content.timezone) },
    ...(content.venue.name ? [{ label: "Venue", value: content.venue.name }] : []),
  ];
  return (
    <header data-inv-exit className="px-6 pt-12 pb-6 sm:px-10 sm:pt-16">
      <Invocation view={view} />
      <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase text-(--inv-accent)" data-inv-hero>
        <span className="size-2 bg-(--inv-accent)" aria-hidden />
        {details.eyebrow}
      </p>
      <HeroTitle view={view} className="inv-display mt-6 max-w-2xl text-[clamp(2.4rem,7vw,4.25rem)] leading-[1.02] font-semibold tracking-[-0.025em] text-balance" headlineClassName="text-sm font-semibold tracking-[0.12em] uppercase text-(--inv-muted)" />
      {content.subheading ? (
        <p className="mt-5 max-w-xl text-lg text-(--inv-muted)" data-inv-hero>
          {content.subheading}
        </p>
      ) : null}
      <div className="relative mt-10 grid overflow-hidden rounded-2xl bg-(--inv-surface) ring-1 ring-(--inv-border) sm:grid-cols-[1fr_auto]" data-inv-hero>
        <dl className="grid gap-5 p-6 sm:grid-cols-3 sm:p-8">
          {rows.map((r) => (
            <div key={r.label}>
              <dt className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-(--inv-muted)">{r.label}</dt>
              <dd className="mt-1 font-semibold text-pretty">{r.value}</dd>
            </div>
          ))}
        </dl>
        {/* Stub: perforated edge with notches cut from the page colour. */}
        <div className="relative flex items-center justify-between gap-4 border-t-2 border-dashed border-(--inv-border) bg-(--inv-accent) px-6 py-4 text-(--inv-accent-contrast) sm:flex-col sm:justify-center sm:border-t-0 sm:border-l-2 sm:px-8" aria-hidden>
          <span className="absolute -top-3 -left-3 size-6 rounded-full bg-(--inv-bg) sm:-top-3 sm:-left-3" />
          <span className="absolute -right-3 -top-3 size-6 rounded-full bg-(--inv-bg) sm:-bottom-3 sm:top-auto sm:-left-3 sm:right-auto" />
          <span className="text-[0.65rem] font-semibold tracking-[0.3em] uppercase sm:[writing-mode:vertical-rl]">Admit one</span>
          <span className="inv-display text-2xl font-semibold tracking-[0.1em]">{monogram(view)}</span>
        </div>
      </div>
    </header>
  );
}

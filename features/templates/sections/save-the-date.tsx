import { cn } from "@/lib/utils/cn";
import { formatDotDate, formatTimeRange, monthGrid } from "@/lib/utils/dates";
import type { InvitationView } from "@/features/templates/types";

interface SaveTheDateProps {
  view: InvitationView;
  title?: string;
  className?: string;
  titleClassName?: string;
  cardClassName?: string;
  align?: "center" | "left";
}

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Typographic save-the-date with a small month calendar. The event day is
 * circled by a hand-drawn stroke that draws itself in on the public page.
 */
export function SaveTheDate({ view, title = "Save the date", className, titleClassName, cardClassName, align = "center" }: SaveTheDateProps) {
  const { content } = view;
  const grid = monthGrid(content.startsAt, content.timezone);
  if (!grid) return null;
  const place = content.venue.name;

  return (
    <div className={cn("flex flex-col gap-10", align === "center" ? "items-center text-center" : "items-start text-left", className)}>
      <div className={cn("flex flex-col gap-3", align === "center" && "items-center")}>
        <h2 className={cn("inv-display text-5xl leading-none sm:text-6xl", titleClassName)} data-inv-reveal="split">
          {title}
        </h2>
        <p className="inv-display mt-3 text-3xl tracking-[0.18em] text-(--inv-accent) tabular-nums sm:text-4xl" data-inv-reveal>
          {formatDotDate(content.startsAt, content.timezone)}
        </p>
        <p className="text-xs font-semibold tracking-[0.28em] uppercase" data-inv-reveal>
          {grid.weekday} · {formatTimeRange(content.startsAt, content.endsAt, content.timezone)}
        </p>
        {place ? (
          <p className="text-sm text-(--inv-muted) italic" data-inv-reveal>
            {place}
          </p>
        ) : null}
      </div>

      <div className={cn("w-full max-w-xs rounded-2xl border border-(--inv-border) bg-(--inv-surface) p-5 shadow-[0_24px_50px_-30px_rgb(0_0_0/0.35)] sm:p-6", cardClassName)} data-inv-reveal>
        <p className="inv-display text-center text-xl">
          {grid.monthName} {grid.year}
        </p>
        <div className="mx-auto mt-3 mb-4 h-px w-12 bg-(--inv-accent)/50" aria-hidden />
        <div className="grid grid-cols-7 gap-y-1.5 text-center text-sm tabular-nums" aria-hidden>
          {WEEK.map((d, i) => (
            <span key={i} className="pb-1 text-[0.65rem] font-semibold tracking-wider text-(--inv-accent)" aria-hidden>
              {d}
            </span>
          ))}
          {Array.from({ length: grid.leading }).map((_, i) => (
            <span key={`b${i}`} aria-hidden />
          ))}
          {Array.from({ length: grid.daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isEvent = day === grid.day;
            return (
              <span key={day} className={cn("relative mx-auto flex size-8 items-center justify-center", isEvent ? "font-semibold text-(--inv-accent)" : "text-(--inv-text)/80")}>
                {day}
                {isEvent ? (
                  <svg viewBox="0 0 48 48" className="pointer-events-none absolute -inset-1.5 size-[calc(100%+0.75rem)] text-(--inv-accent)" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" data-inv-reveal="draw">
                    <path d="M25 5.5C14 4.5 5.5 12 5.5 23.5S14 43 24.5 42.5 43 34.5 42.5 23 33 5 21.5 6.5" />
                  </svg>
                ) : null}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils/cn";
import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import type { InvitationFunction } from "@/lib/validation/functions";
import { DirectionsLink } from "@/features/templates/sections/details";

interface ScheduleProps {
  functions: InvitationFunction[];
  className?: string;
  itemClassName?: string;
  variant?: "timeline" | "cards";
}

export function Schedule({ functions, className, itemClassName, variant = "timeline" }: ScheduleProps) {
  const sorted = [...functions].sort((a, b) => a.sortOrder - b.sortOrder || a.startsAt.localeCompare(b.startsAt));

  return (
    <ol className={cn(variant === "cards" ? "grid gap-4 sm:grid-cols-2" : "relative mx-auto max-w-xl space-y-8 text-left", className)}>
      {sorted.map((fn, idx) => (
        <li
          key={fn.id ?? `${fn.name}-${idx}`}
          data-inv-reveal
          className={cn(
            variant === "cards"
              ? "rounded-2xl border border-(--inv-border) bg-(--inv-surface) p-6 text-left"
              : "relative pl-8 before:absolute before:top-2 before:left-0 before:size-3 before:rounded-full before:bg-(--inv-accent) after:absolute after:top-6 after:left-[5px] after:h-[calc(100%+1rem)] after:w-px after:bg-(--inv-border) last:after:hidden",
            itemClassName,
          )}
        >
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-(--inv-muted)">
            {formatEventDate(fn.startsAt, fn.timezone)} · {formatTimeRange(fn.startsAt, fn.endsAt, fn.timezone)}
          </p>
          <h3 className="inv-display mt-1 text-2xl leading-tight">{fn.name}</h3>
          {fn.venueName || fn.address ? (
            <p className="mt-1 text-sm text-(--inv-muted)">{[fn.venueName, fn.address].filter(Boolean).join(" · ")}</p>
          ) : null}
          {fn.dressCode ? <p className="mt-1 text-sm italic text-(--inv-muted)">Dress code: {fn.dressCode}</p> : null}
          {fn.description ? <p className="mt-3 text-sm leading-relaxed text-pretty">{fn.description}</p> : null}
          {fn.mapsUrl ? (
            <div className="mt-4">
              <DirectionsLink href={fn.mapsUrl} className="px-3 py-1.5 text-xs" />
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

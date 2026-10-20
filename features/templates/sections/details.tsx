import { CalendarDaysIcon, ClockIcon, MapPinIcon, NavigationIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatEventDate, formatTimeRange, formatTimeZoneLabel } from "@/lib/utils/dates";
import type { InvitationView } from "@/features/templates/types";

interface DetailsProps {
  view: InvitationView;
  className?: string;
  itemClassName?: string;
  iconClassName?: string;
  layout?: "stack" | "row";
  showIcons?: boolean;
}

export function DirectionsLink({ href, className, children = "Get directions" }: { href: string; className?: string; children?: React.ReactNode }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-(--inv-accent) px-4 py-2 text-sm font-medium text-(--inv-accent) transition-colors hover:bg-(--inv-accent) hover:text-(--inv-accent-contrast) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--inv-accent)",
        className,
      )}
    >
      <NavigationIcon className="size-4" aria-hidden />
      {children}
    </a>
  );
}

/** Date, time and venue block. Templates style it through className hooks. */
export function EventDetails({ view, className, itemClassName, iconClassName, layout = "stack", showIcons = true }: DetailsProps) {
  const { content } = view;
  const date = formatEventDate(content.startsAt, content.timezone);
  const time = formatTimeRange(content.startsAt, content.endsAt, content.timezone);
  const tz = formatTimeZoneLabel(content.timezone, content.startsAt);
  const hasVenue = Boolean(content.venue.name || content.venue.address);

  const items = [
    { icon: CalendarDaysIcon, label: "Date", lines: [date] },
    { icon: ClockIcon, label: "Time", lines: [`${time} ${tz}`.trim()] },
    ...(hasVenue ? [{ icon: MapPinIcon, label: "Venue", lines: [content.venue.name, content.venue.address].filter(Boolean) }] : []),
  ];

  return (
    <div className={cn(layout === "row" ? "grid gap-6 sm:grid-cols-3" : "flex flex-col gap-6", className)}>
      {items.map((item) => (
        <div key={item.label} className={cn("flex flex-col items-center gap-2", itemClassName)}>
          {showIcons ? <item.icon className={cn("size-5 text-(--inv-accent)", iconClassName)} aria-hidden /> : null}
          <dl>
            <dt className="text-[0.65rem] tracking-[0.2em] uppercase text-(--inv-muted)">{item.label}</dt>
            {item.lines.map((line, i) => (
              <dd key={i} className={cn("text-pretty", i === 0 ? "mt-1 text-base font-medium sm:text-lg" : "text-sm text-(--inv-muted)")}>
                {line}
              </dd>
            ))}
          </dl>
        </div>
      ))}
      {content.venue.mapsUrl ? (
        <div className={cn("flex justify-center", layout === "row" && "sm:col-span-3")}>
          <DirectionsLink href={content.venue.mapsUrl} />
        </div>
      ) : null}
    </div>
  );
}

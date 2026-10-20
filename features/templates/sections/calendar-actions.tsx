import { CalendarPlusIcon, DownloadIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { googleCalendarUrl } from "@/lib/utils/share";
import type { InvitationView } from "@/features/templates/types";
import { shareTitle } from "@/features/templates/title";

interface CalendarActionsProps {
  view: InvitationView;
  className?: string;
  buttonClassName?: string;
}

export function CalendarActions({ view, className, buttonClassName }: CalendarActionsProps) {
  if (!view.settings.showCalendarActions) return null;
  const { content } = view;
  const location = [content.venue.name, content.venue.address].filter(Boolean).join(", ");
  const google = googleCalendarUrl({
    title: shareTitle(content),
    startIso: content.startsAt,
    endIso: content.endsAt || undefined,
    details: content.intro || undefined,
    location: location || undefined,
  });
  const base =
    "inline-flex items-center gap-2 rounded-full border border-(--inv-border) bg-(--inv-surface) px-4 py-2 text-sm font-medium transition-colors hover:border-(--inv-accent) hover:text-(--inv-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--inv-accent)";

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3", className)}>
      <a href={google} target="_blank" rel="noopener noreferrer" className={cn(base, buttonClassName)}>
        <CalendarPlusIcon className="size-4" aria-hidden /> Google Calendar
      </a>
      <a href={`/api/ics/${view.slug}`} className={cn(base, buttonClassName)} download>
        <DownloadIcon className="size-4" aria-hidden /> Apple / Outlook (.ics)
      </a>
    </div>
  );
}

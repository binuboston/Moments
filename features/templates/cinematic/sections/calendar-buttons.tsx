"use client";

import { CalendarPlusIcon, DownloadIcon } from "lucide-react";
import { buildIcs } from "@/lib/utils/ics";
import { googleCalendarUrl } from "@/lib/utils/share";
import { cn } from "@/lib/utils/cn";

interface CalendarButtonsProps {
  slug: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  details: string;
  url: string;
  className?: string;
}

/** Google Calendar link plus a client-generated .ics file (works in previews and offline). */
export function CalendarButtons({ slug, title, startsAt, endsAt, location, details, url, className }: CalendarButtonsProps) {
  const google = googleCalendarUrl({ title, startIso: startsAt, endIso: endsAt || undefined, details: [details, url].filter(Boolean).join("\n\n") || undefined, location: location || undefined });

  const downloadIcs = () => {
    const ics = buildIcs({ uid: `${slug}@mirth`, title, startIso: startsAt, endIso: endsAt || undefined, location: location || undefined, description: [details, url].filter(Boolean).join("\n\n") || undefined, url });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `${slug}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <a href={google} target="_blank" rel="noopener noreferrer" className="cine-button" data-testid="add-google-calendar">
        <CalendarPlusIcon className="size-4" aria-hidden /> Google Calendar
      </a>
      <button type="button" onClick={downloadIcs} className="cine-button cine-button-ghost" data-testid="download-ics">
        <DownloadIcon className="size-4" aria-hidden /> Apple / Outlook
      </button>
    </div>
  );
}

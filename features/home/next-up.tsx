"use client";

import { CalendarHeartIcon } from "lucide-react";
import Link from "next/link";
import { useClientNow } from "@/hooks/use-mounted";
import type { OverviewSummary } from "@/features/invitations/queries";
import { routes } from "@/lib/routes";

/** "Next up: Aisha & Rohan · in 29 days" (days computed in the browser to avoid hydration drift). */
export function NextUp({ next }: { next: NonNullable<OverviewSummary["next"]> }) {
  const now = useClientNow();
  const days = now === null ? null : Math.max(0, Math.ceil((new Date(next.startsAt).getTime() - now) / 86_400_000));
  return (
    <Link href={routes.editInvitation(next.id)} className="inline-flex max-w-full items-center gap-2 rounded-full bg-fill px-4 py-2 text-sm transition-colors hover:bg-fill-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
      <CalendarHeartIcon className="size-4 shrink-0 text-primary" aria-hidden />
      <span className="truncate">
        <span className="text-muted-foreground">Next up:</span> <span className="font-semibold">{next.title}</span>
      </span>
      {days !== null ? <span className="shrink-0 font-semibold text-primary">{days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}</span> : null}
    </Link>
  );
}

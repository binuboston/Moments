"use client";

import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { InvitationActions } from "@/features/invitations/components/invitation-actions";
import { StatusBadge } from "@/features/invitations/components/status-badge";
import type { InvitationListItem } from "@/features/invitations/types";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { useClientNow } from "@/hooks/use-mounted";
import { routes } from "@/lib/routes";
import { formatShortDate } from "@/lib/utils/dates";

/** "Today", "Tomorrow", "In 12 days" or "Past" (computed in the browser after mount). */
function daysLabel(startsAt: string, now: number): string {
  const days = Math.ceil((new Date(startsAt).getTime() - now) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days < 0) return "Past";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

const overlayButton =
  "flex size-9 items-center justify-center rounded-full bg-surface/95 text-foreground shadow-sm transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/**
 * An invitation as a "pin": the design thumbnail first (16px corners, no
 * card chrome), a scrim with Edit / open / more actions on hover (always
 * visible on touch screens), title and details underneath.
 */
export function InvitationCard({ item }: { item: InvitationListItem }) {
  const def = getTemplateOrFallback(item.templateKey);
  const title = item.title || "Untitled invitation";
  const now = useClientNow();
  const when = now !== null && item.startsAt ? daysLabel(item.startsAt, now) : "";
  const reveal = "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-(--duration-base)";

  return (
    <article className="group relative">
      <div className="relative aspect-[1200/630] overflow-hidden rounded-2xl" style={{ background: def.previewGradient }}>
        {/* Real design thumbnail (owner-only route, versioned by updatedAt for caching). Plain <img>: the
            image optimiser cannot forward the owner's session cookie. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/api/invitations/${item.id}/thumbnail?v=${encodeURIComponent(item.updatedAt)}`} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-(--duration-base) md:group-hover:bg-black/25" />
        <span className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
          <StatusBadge status={item.status} className="bg-surface/95 shadow-sm max-sm:h-5 max-sm:px-1.5 max-sm:text-[0.65rem]" />
        </span>
        <Link
          href={routes.editInvitation(item.id)}
          className="absolute top-2.5 right-2.5 z-10 hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground opacity-0 transition-opacity duration-(--duration-base) group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:block"
        >
          Edit
        </Link>
        <div className={`absolute right-2 bottom-2 z-10 flex gap-1.5 sm:right-2.5 sm:bottom-2.5 ${reveal}`}>
          {item.status === "published" ? (
            <a href={item.publicUrl} target="_blank" rel="noopener noreferrer" className={overlayButton} aria-label={`Open ${title}`}>
              <ArrowUpRightIcon className="size-4" aria-hidden />
            </a>
          ) : null}
          <InvitationActions item={item} triggerClassName={overlayButton} />
        </div>
      </div>
      <div className="mt-2 px-1">
        <h3 className="truncate text-sm font-semibold">
          {/* Stretched link: the whole pin opens the editor. */}
          <Link href={routes.editInvitation(item.id)} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring" aria-label={`Edit invitation: ${title}`}>
            {title}
          </Link>
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <span className="truncate">
            {item.categoryName}
            {item.startsAt ? ` · ${formatShortDate(item.startsAt, item.timezone)}` : ""}
          </span>
          {when && when !== "Past" ? <span className="shrink-0 rounded-full bg-primary/10 px-1.5 font-semibold text-primary">{when}</span> : null}
        </p>
      </div>
    </article>
  );
}

"use client";

import { ArrowUpRightIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { InvitationActions } from "@/features/invitations/components/invitation-actions";
import { StatusDot } from "@/features/invitations/components/status-badge";
import type { InvitationListItem } from "@/features/invitations/types";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { useClientNow } from "@/hooks/use-mounted";
import { categoryStyle, TONES } from "@/lib/design/tones";
import { ROUTES, routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";
import { formatShortDate } from "@/lib/utils/dates";

/** "Today!", "Tomorrow", "in 12 days" (computed in the browser after mount); nothing once it has passed. */
function countdown(startsAt: string, now: number): string {
  const days = Math.ceil((new Date(startsAt).getTime() - now) / 86_400_000);
  if (Number.isNaN(days) || days < 0) return "";
  if (days === 0) return "Today!";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}

const overlayButton =
  "flex size-9 items-center justify-center rounded-full bg-surface/95 text-foreground shadow-sm transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** Shared pin frame: same proportions for invitations and the create tile. */
const PIN = "relative aspect-[1200/630] overflow-hidden rounded-2xl";

/**
 * Gentle lift on hover, applied to the whole pin. (Transforming only the
 * thumbnail would give it its own stacking layer, and the stretched title
 * link would then cover the hover buttons.)
 */
const LIFT = "transition-transform duration-500 ease-(--ease-out-quart) motion-safe:md:hover:-translate-y-1";

/**
 * An invitation as a "pin": the design first, no card chrome. A status dot
 * in the corner (no text; the filter chips are the legend), quick actions on
 * hover (always shown on touch screens), and the title with the occasion's
 * colour and a countdown underneath. The whole pin opens the editor.
 */
export function InvitationCard({ item }: { item: InvitationListItem }) {
  const def = getTemplateOrFallback(item.templateKey);
  const title = item.title || "Untitled invitation";
  const now = useClientNow();
  const when = now !== null && item.startsAt ? countdown(item.startsAt, now) : "";
  const occasion = categoryStyle(item.categorySlug);
  const reveal = "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity duration-(--duration-base)";

  return (
    <article className={cn("group relative", LIFT)}>
      <div className={PIN} style={{ background: def.previewGradient }}>
        {/* Real design thumbnail (owner-only route, versioned by updatedAt for caching). Plain <img>: the
            image optimiser cannot forward the owner's session cookie. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/invitations/${item.id}/thumbnail?v=${encodeURIComponent(item.updatedAt)}`}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-(--ease-out-quart) motion-safe:md:group-hover:scale-[1.04]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-(--duration-base) md:group-hover:bg-black/15" />
        <span className="absolute top-2 left-2 grid size-6 place-items-center rounded-full bg-surface/95 shadow-sm sm:top-2.5 sm:left-2.5" data-testid="status-dot">
          <StatusDot status={item.status} />
        </span>
        <div className={cn("absolute right-2 bottom-2 z-10 flex gap-1.5 sm:right-2.5 sm:bottom-2.5", reveal)}>
          {item.status === "published" ? (
            <a href={item.publicUrl} target="_blank" rel="noopener noreferrer" className={overlayButton} aria-label={`Open ${title}`}>
              <ArrowUpRightIcon className="size-4" aria-hidden />
            </a>
          ) : null}
          <InvitationActions item={item} triggerClassName={overlayButton} />
        </div>
      </div>
      <div className="mt-2.5 px-1">
        <h3 className="truncate text-sm font-semibold">
          {/* Stretched link: the whole pin opens the editor. */}
          <Link href={routes.editInvitation(item.id)} className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-ring" aria-label={`Edit invitation: ${title}`}>
            {title}
          </Link>
        </h3>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <span aria-hidden className={cn("grid size-5 shrink-0 place-items-center rounded-md [&>svg]:size-3", TONES[occasion.tone])}>
            <occasion.icon />
          </span>
          <span className="truncate">
            {item.categoryName}
            {/* Phones: occasion + countdown fit; the date joins from tablet size (or when there is no countdown). */}
            {item.startsAt ? <span className={cn(when && "hidden sm:inline")}>{` · ${formatShortDate(item.startsAt, item.timezone)}`}</span> : null}
          </span>
          {when ? <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-semibold", when === "Today!" ? "bg-primary text-primary-foreground" : TONES[occasion.tone])}>{when}</span> : null}
        </p>
      </div>
    </article>
  );
}

/** First pin in the list: start a new invitation. Same shape as an invitation, playful on hover. */
export function CreateInvitationTile() {
  return (
    <Link href={ROUTES.newInvitation} className={cn("group block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", LIFT)} data-testid="create-tile">
      <div className={cn(PIN, "grid place-items-center border-2 border-dashed border-border bg-fill/50 transition-colors group-hover:border-primary/40 group-hover:bg-primary/5")}>
        <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform duration-500 ease-(--ease-out-quart) group-hover:scale-110 group-hover:rotate-90">
          <PlusIcon className="size-6" aria-hidden />
        </span>
      </div>
      <p className="mt-2.5 px-1 text-sm font-semibold">New invitation</p>
      <p className="mt-1 px-1 text-xs text-muted-foreground">Pick an occasion and a design</p>
    </Link>
  );
}

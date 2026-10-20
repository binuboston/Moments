"use client";

import { ArrowUpRightIcon, CalendarIcon, PencilIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/icon-tile";
import { useTilt } from "@/components/motion/use-tilt";
import { InvitationActions } from "@/features/invitations/components/invitation-actions";
import { StatusBadge } from "@/features/invitations/components/status-badge";
import type { InvitationListItem } from "@/features/invitations/types";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { useClientNow } from "@/hooks/use-mounted";
import { categoryStyle } from "@/lib/design/tones";
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

/**
 * Invitation card on the app canvas: a borderless white surface with the
 * design thumbnail inset at the top, the occasion's tone tile, a corner
 * actions button and a full-width soft primary action.
 */
export function InvitationCard({ item }: { item: InvitationListItem }) {
  const def = getTemplateOrFallback(item.templateKey);
  const title = item.title || "Untitled invitation";
  const style = categoryStyle(item.categorySlug);
  const tilt = useTilt<HTMLDivElement>(3);
  const now = useClientNow();
  const when = now !== null && item.startsAt ? daysLabel(item.startsAt, now) : "";

  return (
    <div ref={tilt} className="h-full">
      <article className="group surface-card surface-hover flex h-full flex-col p-2.5">
        <Link
          href={`/dashboard/invitations/${item.id}/edit`}
          className="relative block aspect-[1200/630] overflow-hidden rounded-[calc(var(--card-radius)-0.5rem)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          style={{ background: def.previewGradient }}
          aria-label={`Edit ${title}`}
          tabIndex={-1}
        >
          {/* Real design thumbnail (owner-only route, versioned by updatedAt for caching). Plain <img>: the
              image optimiser cannot forward the owner's session cookie. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/invitations/${item.id}/thumbnail?v=${encodeURIComponent(item.updatedAt)}`}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover transition-transform duration-(--duration-slow) ease-(--ease-out-quart) group-hover:scale-[1.04]"
          />
          {/* Light sweep on hover. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-[translate,opacity] duration-700 ease-(--ease-out-quart) group-hover:translate-x-[420%] group-hover:opacity-100"
          />
          <span className="absolute top-2.5 left-2.5">
            <StatusBadge status={item.status} className="bg-surface/90 shadow-sm backdrop-blur" />
          </span>
        </Link>

        <div className="flex flex-1 flex-col px-2.5 pt-4 pb-2">
          <div className="flex items-start justify-between gap-3">
            <IconTile icon={style.icon} tone={style.tone} />
            <InvitationActions item={item} />
          </div>
          <h3 className="mt-3.5 line-clamp-2 text-lg leading-snug font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {item.categoryName} · {item.templateName}
          </p>
          <dl className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            {item.startsAt ? (
              <div className="inline-flex items-center gap-1.5">
                <CalendarIcon className="size-3.5" aria-hidden />
                <dd>{formatShortDate(item.startsAt, item.timezone)}</dd>
              </div>
            ) : null}
            {when ? <dd className={when === "Past" ? "" : "rounded-full bg-primary/8 px-2 py-0.5 font-medium text-primary"}>{when}</dd> : null}
            {item.rsvpEnabled ? (
              <div className="inline-flex items-center gap-1.5">
                <UsersIcon className="size-3.5" aria-hidden />
                <dd>RSVP on</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-auto flex items-center gap-2 pt-5">
            <Button asChild variant="soft" className="flex-1">
              <Link href={`/dashboard/invitations/${item.id}/edit`}>
                <PencilIcon aria-hidden /> Edit invitation
              </Link>
            </Button>
            {item.status === "published" ? (
              <Button asChild variant="soft" size="icon">
                <a href={item.publicUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${title}`}>
                  <ArrowUpRightIcon aria-hidden />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}

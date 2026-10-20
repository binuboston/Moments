"use client";

import { CalendarIcon, ExternalLinkIcon, PencilIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InvitationActions } from "@/features/invitations/components/invitation-actions";
import { StatusBadge } from "@/features/invitations/components/status-badge";
import type { InvitationListItem } from "@/features/invitations/types";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { formatShortDate } from "@/lib/utils/dates";

export function InvitationCard({ item }: { item: InvitationListItem }) {
  const def = getTemplateOrFallback(item.templateKey);
  const title = item.title || "Untitled invitation";

  return (
    <article className="group interactive-lift flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <Link
        href={`/dashboard/invitations/${item.id}/edit`}
        className="relative block aspect-[1200/630] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        style={{ background: def.previewGradient }}
        aria-label={`Edit ${title}`}
      >
        {/* Real design thumbnail (owner-only route, versioned by updatedAt for caching). Plain <img>: the
            image optimiser cannot forward the owner's session cookie. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/invitations/${item.id}/thumbnail?v=${encodeURIComponent(item.updatedAt)}`}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-transform duration-(--duration-slow) ease-(--ease-out-quart) group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:gap-3 sm:p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[0.95rem] font-semibold tracking-tight sm:text-base">{title}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {item.categoryName} · {item.templateName}
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {item.startsAt ? (
            <div className="inline-flex items-center gap-1.5">
              <CalendarIcon className="size-3.5" aria-hidden />
              <dd>{formatShortDate(item.startsAt, item.timezone)}</dd>
            </div>
          ) : null}
          {item.rsvpEnabled ? (
            <div className="inline-flex items-center gap-1.5">
              <UsersIcon className="size-3.5" aria-hidden />
              <dd>RSVP on</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-auto flex items-center justify-between gap-2 pt-1 sm:pt-2">
          <div className="flex min-w-0 items-center gap-1">
            <Button asChild size="sm" variant="outline">
              <Link href={`/dashboard/invitations/${item.id}/edit`}>
                <PencilIcon aria-hidden /> Edit
              </Link>
            </Button>
            {item.status === "published" ? (
              <Button asChild size="sm" variant="ghost">
                <a href={item.publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon aria-hidden /> Open
                </a>
              </Button>
            ) : null}
          </div>
          <InvitationActions item={item} />
        </div>
      </div>
    </article>
  );
}

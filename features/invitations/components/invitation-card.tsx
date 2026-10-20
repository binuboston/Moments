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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft transition-shadow hover:shadow-lift">
      <Link href={`/dashboard/invitations/${item.id}/edit`} className="block h-24 outline-none focus-visible:ring-2 focus-visible:ring-ring" style={{ background: def.previewGradient }} aria-label={`Edit ${title}`}>
        <div className="flex h-full items-end justify-between p-4">
          <span className="rounded-full bg-surface/85 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur">{item.templateName}</span>
          <StatusBadge status={item.status} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold tracking-tight">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.categoryName}</p>
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
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-1">
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

"use client";

import { useFlipList } from "@/components/motion/use-flip-list";
import { CreateInvitationTile, InvitationCard } from "@/features/invitations/components/invitation-card";
import type { InvitationListItem } from "@/features/invitations/types";
import { cn } from "@/lib/utils/cn";

/** Responsive invitation grid with animated layout changes (publish, duplicate, delete). `createTile` leads with a "New invitation" pin. */
export function InvitationGrid({ items, busy = false, createTile = false, className }: { items: InvitationListItem[]; busy?: boolean; createTile?: boolean; className?: string }) {
  const ref = useFlipList<HTMLUListElement>(items.map((i) => i.id));
  return (
    <ul ref={ref} className={cn("grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4 transition-opacity", busy && "opacity-70", className)} aria-busy={busy}>
      {createTile ? (
        <li>
          <CreateInvitationTile />
        </li>
      ) : null}
      {items.map((item) => (
        <li key={item.id} data-flip-id={item.id}>
          <InvitationCard item={item} />
        </li>
      ))}
    </ul>
  );
}

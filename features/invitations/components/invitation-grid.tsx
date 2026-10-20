"use client";

import { useFlipList } from "@/components/motion/use-flip-list";
import { InvitationCard } from "@/features/invitations/components/invitation-card";
import type { InvitationListItem } from "@/features/invitations/types";
import { cn } from "@/lib/utils/cn";

/** Responsive invitation grid with animated layout changes (publish, duplicate, delete). */
export function InvitationGrid({ items, busy = false, className }: { items: InvitationListItem[]; busy?: boolean; className?: string }) {
  const ref = useFlipList<HTMLUListElement>(items.map((i) => i.id));
  return (
    <ul ref={ref} className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 transition-opacity", busy && "opacity-70", className)} aria-busy={busy}>
      {items.map((item) => (
        <li key={item.id} data-flip-id={item.id}>
          <InvitationCard item={item} />
        </li>
      ))}
    </ul>
  );
}

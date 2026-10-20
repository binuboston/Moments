import { Badge } from "@/components/ui/badge";
import type { InvitationStatus } from "@/types/domain";

const map: Record<InvitationStatus, { label: string; variant: "warning" | "success" | "default" }> = {
  draft: { label: "Draft", variant: "warning" },
  published: { label: "Published", variant: "success" },
  unpublished: { label: "Unpublished", variant: "default" },
};

import { cn } from "@/lib/utils/cn";

export function StatusBadge({ status, className }: { status: InvitationStatus; className?: string }) {
  const { label, variant } = map[status];
  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      {status === "published" ? (
        // Live indicator: a soft ping around a solid dot.
        <span aria-hidden className="relative flex size-1.5">
          <span className="absolute inline-flex size-full rounded-full bg-current opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {label}
    </Badge>
  );
}

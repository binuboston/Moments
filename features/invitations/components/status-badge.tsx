import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import type { InvitationStatus } from "@/types/domain";

const STATUS: Record<InvitationStatus, { label: string; variant: "warning" | "success" | "default"; dot: string }> = {
  draft: { label: "Draft", variant: "warning", dot: "bg-status-draft" },
  published: { label: "Published", variant: "success", dot: "bg-status-live" },
  unpublished: { label: "Unpublished", variant: "default", dot: "bg-status-off" },
};

export const statusLabel = (status: InvitationStatus) => STATUS[status].label;

/** A status pill with text, for places with room to explain (editor, publish sheet, admin). */
export function StatusBadge({ status, className }: { status: InvitationStatus; className?: string }) {
  const { label, variant } = STATUS[status];
  return (
    <Badge variant={variant} className={cn("gap-1.5", className)}>
      {status === "published" ? <LivePulse /> : null}
      {label}
    </Badge>
  );
}

/**
 * Status as a coloured dot only: amber for a draft, green (pulsing) when
 * live, grey when unpublished. For dense lists, where the filter chips act as
 * the legend. The label is still there for screen readers and as a tooltip.
 */
export function StatusDot({ status, className }: { status: InvitationStatus; className?: string }) {
  const { label, dot } = STATUS[status];
  return (
    <span role="img" aria-label={label} title={label} className={cn("relative inline-flex size-2.5 shrink-0 rounded-full", dot, className)}>
      {status === "published" ? <span aria-hidden className={cn("absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping", dot)} /> : null}
    </span>
  );
}

/** Live indicator: a soft ping around a solid dot, in the current colour. */
function LivePulse() {
  return (
    <span aria-hidden className="relative flex size-1.5">
      <span className="absolute inline-flex size-full rounded-full bg-current opacity-60 motion-safe:animate-ping" />
      <span className="relative inline-flex size-1.5 rounded-full bg-current" />
    </span>
  );
}

import { Badge } from "@/components/ui/badge";
import type { InvitationStatus } from "@/types/domain";

const map: Record<InvitationStatus, { label: string; variant: "warning" | "success" | "default" }> = {
  draft: { label: "Draft", variant: "warning" },
  published: { label: "Published", variant: "success" },
  unpublished: { label: "Unpublished", variant: "default" },
};

export function StatusBadge({ status }: { status: InvitationStatus }) {
  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

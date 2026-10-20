import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ROUTES } from "@/lib/routes";

export default function EditNotFound() {
  return (
    <EmptyState
      title="Invitation not found"
      description="It may have been deleted, or it belongs to a different account."
      action={
        <Button asChild>
          <Link href={ROUTES.invitations}>Back to invitations</Link>
        </Button>
      }
    />
  );
}

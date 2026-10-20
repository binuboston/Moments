"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * Global "New invitation" in the app header, on every page except the create
 * flow itself. Icon-only on phones, labelled from sm up.
 */
export function TopBarAction() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard/invitations/new")) return null;
  return (
    <Button asChild size="sm" className="max-sm:size-10 max-sm:px-0" data-testid="header-new-invitation">
      <Link href="/dashboard/invitations/new" aria-label="New invitation">
        <PlusIcon aria-hidden />
        <span className="max-sm:sr-only">New invitation</span>
      </Link>
    </Button>
  );
}

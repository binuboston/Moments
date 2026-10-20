"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

/** Slim reminder for guests: everything works, an account is only needed to publish. */
export function GuestBanner() {
  const pathname = usePathname();
  const next = encodeURIComponent(pathname);
  return (
    <div className="mx-auto mb-5 flex w-full max-w-6xl flex-col gap-3 rounded-2xl bg-tone-rose px-4 py-3 text-sm text-tone-rose-ink sm:flex-row sm:items-center sm:justify-between" data-testid="guest-banner">
      <p className="flex items-start gap-2.5">
        <SparklesIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span>
          <span className="font-semibold">You&apos;re designing as a guest.</span> Your drafts are saved in this browser. Create a free account to publish and use them anywhere.
        </span>
      </p>
      <div className="flex shrink-0 gap-2">
        <Button asChild size="sm" variant="soft" className="bg-surface/70 hover:bg-surface">
          <Link href={`/login?next=${next}`}>Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href={`/signup?next=${next}`}>Create account</Link>
        </Button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "@/components/layout/account-menu";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/features/auth/account-context";
import { GlobalSearch } from "@/features/search/components/global-search";
import { ROUTES } from "@/lib/routes";

/** Top of every page: the global search and the account (or Log in / Sign up). */
export function TopBar() {
  const account = useAccount();
  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:h-20 sm:gap-4 sm:px-6">
        <Logo className="md:hidden" />
        <Suspense fallback={<div className="h-12 flex-1 rounded-full bg-fill" />}>
          <GlobalSearch variant="inline" className="hidden min-w-0 flex-1 sm:block" />
        </Suspense>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {account === undefined ? (
            <span aria-hidden className="size-10 rounded-full bg-fill" />
          ) : account ? (
            <AccountMenu account={account} />
          ) : (
            <>
              <Button asChild variant="soft" size="sm" className="font-semibold">
                <Link href={ROUTES.login}>Log in</Link>
              </Button>
              <Button asChild size="sm" className="font-semibold">
                <Link href={ROUTES.signup}>Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="px-4 pb-3 sm:hidden">
        <Suspense fallback={<div className="h-12 rounded-full bg-fill" />}>
          <GlobalSearch variant="sheet" />
        </Suspense>
      </div>
    </header>
  );
}

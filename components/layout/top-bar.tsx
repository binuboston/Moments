"use client";

import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "@/components/layout/account-menu";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/features/auth/account-context";
import { GlobalSearch } from "@/features/search/components/global-search";
import { ROUTES } from "@/lib/routes";

/**
 * Top of every page: the global search and the account (or Log in / Sign up).
 * Phones: one compact row (wordmark and a search pill that opens
 * full-screen search); the account lives in the tab bar's Menu there.
 */
export function TopBar() {
  const account = useAccount();
  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2.5 px-4 sm:h-20 sm:gap-4 sm:px-6">
        <Logo className="shrink-0 md:hidden" />
        <Suspense fallback={<div className="h-10 min-w-0 flex-1 rounded-full bg-fill sm:h-12" />}>
          <GlobalSearch variant="inline" className="hidden min-w-0 flex-1 sm:block" />
          <GlobalSearch variant="sheet" className="min-w-0 flex-1 sm:hidden" />
        </Suspense>
        {/* Below md the tab bar's Menu holds the account (and Log in / Sign up). */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
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
    </header>
  );
}

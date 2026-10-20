"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/layout/account-menu";
import { Logo } from "@/components/layout/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PrimaryNav } from "@/components/layout/primary-nav";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/layout/app-link";
import { useAccount } from "@/features/auth/account-context";
import { ROUTES } from "@/lib/routes";

interface AppHeaderProps {
  /** "app" paints a canvas backing so content never shows through the gaps around the bar. */
  variant?: "site" | "app";
}

/**
 * The one header for the whole product (marketing site and app): logo to the
 * landing page, the shared navigation, "New invitation" and the account.
 */
export function AppHeader({ variant = "site" }: AppHeaderProps) {
  // From the nearest AccountProvider: server-known in the app, resolved in the browser on the site.
  const account = useAccount();
  const pathname = usePathname();
  const creating = pathname.startsWith(ROUTES.newInvitation);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      {variant === "app" ? <div aria-hidden className="app-canvas absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]" /> : null}
      <div className="surface-float mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto] items-center gap-3 rounded-2xl px-3 sm:h-16 sm:px-5 md:grid-cols-[1fr_auto_1fr]">
        <Logo />
        <PrimaryNav className="hidden md:block" />
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {creating ? null : (
            <Button asChild size="sm" className="max-sm:size-10 max-sm:px-0" data-testid="header-new-invitation">
              <AppLink href={ROUTES.newInvitation} aria-label="New invitation">
                <PlusIcon aria-hidden />
                <span className="max-sm:sr-only">New invitation</span>
              </AppLink>
            </Button>
          )}
          {account === undefined ? (
            <span aria-hidden className="size-10 rounded-full bg-fill" />
          ) : account ? (
            <AccountMenu account={account} />
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link href={ROUTES.login}>Log in</Link>
            </Button>
          )}
          <MobileNav account={account} />
        </div>
      </div>
    </header>
  );
}

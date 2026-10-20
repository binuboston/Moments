"use client";

import { SettingsIcon } from "lucide-react";
import { AppLink } from "@/components/layout/app-link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAccount } from "@/features/auth/account-context";
import { ROUTES, SUPPORT_NAV } from "@/lib/routes";

/**
 * "Settings & support" at the foot of the side rail: account settings plus the
 * product, help and legal pages (the marketing pages live here, not in the main nav).
 */
export function SupportMenu() {
  const account = useAccount();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-12 items-center justify-center rounded-xl text-foreground outline-none transition-colors hover:bg-fill focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-fill"
        aria-label="Settings and support"
        title="Settings & support"
        data-testid="support-menu"
      >
        <SettingsIcon className="size-6" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" sideOffset={12} className="w-60 rounded-2xl border-0 p-2 shadow-float">
        {account ? (
          <>
            <DropdownMenuLabel className="px-2 text-xs font-medium text-muted-foreground">Settings</DropdownMenuLabel>
            <DropdownMenuItem asChild className="rounded-xl font-semibold">
              <AppLink href={ROUTES.settings}>{account.isGuest ? "Account" : "Account settings"}</AppLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuLabel className="px-2 text-xs font-medium text-muted-foreground">Support</DropdownMenuLabel>
        {SUPPORT_NAV.map((item) => (
          <DropdownMenuItem key={item.href} asChild className="rounded-xl font-semibold">
            <AppLink href={item.href}>{item.label}</AppLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { CheckIcon, SettingsIcon } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import { THEME_OPTIONS } from "@/components/layout/theme-switcher";
import { setThemePreference, useThemePreference, type ThemePreference } from "@/lib/theme";
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
  const theme = useThemePreference();
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
        <DropdownMenuLabel className="px-2 text-xs font-medium text-muted-foreground">Appearance</DropdownMenuLabel>
        <DropdownMenuPrimitive.RadioGroup value={theme} onValueChange={(v) => setThemePreference(v as ThemePreference)}>
          {THEME_OPTIONS.map((o) => (
            <DropdownMenuPrimitive.RadioItem
              key={o.value}
              value={o.value}
              // Keep the menu open so the change can be seen.
              onSelect={(e) => e.preventDefault()}
              className="flex cursor-default items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-semibold outline-none select-none data-[highlighted]:bg-fill"
              data-testid={`menu-theme-${o.value}`}
            >
              <o.icon className="size-4 text-muted-foreground" aria-hidden />
              {o.label}
              <DropdownMenuPrimitive.ItemIndicator className="ml-auto">
                <CheckIcon className="size-4" aria-hidden />
              </DropdownMenuPrimitive.ItemIndicator>
            </DropdownMenuPrimitive.RadioItem>
          ))}
        </DropdownMenuPrimitive.RadioGroup>
        <DropdownMenuSeparator />
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

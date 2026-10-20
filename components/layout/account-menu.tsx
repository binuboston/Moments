"use client";

import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AccountAvatar } from "@/components/layout/account-avatar";
import { AppLink } from "@/components/layout/app-link";
import { useSignOut } from "@/features/auth/use-sign-out";
import type { Account } from "@/lib/auth/account";
import { accountView, type AccountAction } from "@/lib/auth/account-actions";

/** Desktop account dropdown. Renders the shared account model (lib/auth/account-actions). */
export function AccountMenu({ account }: { account: Account }) {
  const { signOut } = useSignOut();
  const view = accountView(account);
  const identity = view.identity!;

  const item = (a: AccountAction, emphasis = false) =>
    a.href ? (
      <DropdownMenuItem key={a.key} asChild>
        <AppLink href={a.href} className={emphasis ? "font-medium text-primary" : undefined}>
          <a.icon /> {a.label}
        </AppLink>
      </DropdownMenuItem>
    ) : (
      <DropdownMenuItem key={a.key} onSelect={signOut} data-testid="menu-logout">
        <a.icon /> {a.label}
      </DropdownMenuItem>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="-mr-1.5 rounded-full p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Account menu">
        <AccountAvatar identity={identity} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-foreground">{identity.title}</span>
            {identity.plan ? (
              <Badge variant={identity.plan === "pro" ? "accent" : "outline"} className="shrink-0 capitalize">
                {identity.plan}
              </Badge>
            ) : null}
          </span>
          <span className="block truncate text-xs font-normal">{identity.subtitle}</span>
        </DropdownMenuLabel>
        {view.primary ? item(view.primary, true) : null}
        <DropdownMenuSeparator />
        {view.actions.map((a) => (a.key === "signOut" ? [<DropdownMenuSeparator key="sep" />, item(a)] : item(a)))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

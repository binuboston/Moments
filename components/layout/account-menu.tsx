"use client";

import { LayoutDashboardIcon, LogInIcon, LogOutIcon, SettingsIcon, ShieldIcon, SparklesIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useSignOut } from "@/features/auth/use-sign-out";
import type { Account } from "@/lib/auth/account";
import { ROUTES } from "@/lib/routes";
import { initials } from "@/lib/utils/format";

const trigger = "-mr-1.5 rounded-full p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

/** The account menu in the header. Guests are offered an account instead of sign-out (which would lose their drafts). */
export function AccountMenu({ account }: { account: Account }) {
  const { signOut } = useSignOut();

  if (account.isGuest) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className={trigger} aria-label="Account menu">
          <Avatar>
            <AvatarFallback>
              <UserRoundIcon className="size-4" aria-hidden />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <span className="block text-sm font-medium text-foreground">Guest</span>
            <span className="block text-xs font-normal">Your drafts are saved in this browser.</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={ROUTES.app}>
              <LayoutDashboardIcon /> My invitations
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.signup} className="font-medium text-primary">
              <SparklesIcon /> Create free account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.login}>
              <LogInIcon /> Log in
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={trigger} aria-label="Account menu">
        <Avatar>
          <AvatarFallback>{initials(account.name || account.email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-foreground">{account.name || "Your account"}</span>
            <Badge variant={account.plan === "pro" ? "accent" : "outline"} className="shrink-0 capitalize">
              {account.plan}
            </Badge>
          </span>
          <span className="block truncate text-xs font-normal">{account.email}</span>
        </DropdownMenuLabel>
        {account.plan === "free" ? (
          <DropdownMenuItem asChild>
            <Link href={ROUTES.pricing} className="font-medium text-primary">
              <SparklesIcon /> Upgrade to Pro
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={ROUTES.app}>
            <LayoutDashboardIcon /> My invitations
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={ROUTES.settings}>
            <SettingsIcon /> Settings
          </Link>
        </DropdownMenuItem>
        {account.role === "admin" ? (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <ShieldIcon /> Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut} data-testid="menu-logout">
          <LogOutIcon /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { LogInIcon, LogOutIcon, SettingsIcon, ShieldIcon, SparklesIcon, UserIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ShellUser } from "@/components/dashboard/dashboard-shell";
import { initials } from "@/lib/utils/format";
import { useSignOut } from "@/features/auth/use-sign-out";

export function UserMenu({ user }: { user: ShellUser }) {
  const { signOut } = useSignOut();

  if (user.isGuest) {
    // Guests have no account yet: offer to create one (drafts come along). No sign-out, which would lose them.
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="-mr-1.5 rounded-full p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Account menu">
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
            <Link href="/signup" className="font-medium text-primary">
              <SparklesIcon /> Create free account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/login">
              <LogInIcon /> Log in
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="-mr-1.5 rounded-full p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="Account menu">
        <Avatar>
          <AvatarFallback>{initials(user.name || user.email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-foreground">{user.name || "Your account"}</span>
            <Badge variant={user.plan === "pro" ? "accent" : "outline"} className="shrink-0 capitalize">
              {user.plan}
            </Badge>
          </span>
          <span className="block truncate text-xs font-normal">{user.email}</span>
        </DropdownMenuLabel>
        {user.plan === "free" ? (
          <DropdownMenuItem asChild>
            <Link href="/pricing" className="font-medium text-primary">
              <SparklesIcon /> Upgrade to Pro
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <UserIcon /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings#security">
            <SettingsIcon /> Security
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" ? (
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

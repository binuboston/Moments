"use client";

import { LayoutDashboardIcon, MailIcon, PlusIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboardIcon, exact: true },
  { href: "/dashboard/invitations", label: "Invitations", icon: MailIcon },
  { href: "/dashboard/invitations/new", label: "Create", icon: PlusIcon, primary: true },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

/** Focused flows have their own bottom action bars, so the tab bar steps aside. */
export function isFocusedFlow(pathname: string) {
  return pathname.startsWith("/dashboard/invitations/new") || /\/dashboard\/invitations\/[^/]+\/edit/.test(pathname);
}

/** Thumb-reachable tab bar for phones and small tablets. Hidden from lg up, where the sidebar takes over. */
export function BottomNav() {
  const pathname = usePathname();
  if (isFocusedFlow(pathname)) return null;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : href === "/dashboard/invitations" ? pathname.startsWith(href) && !pathname.startsWith("/dashboard/invitations/new") : pathname.startsWith(href);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
        {items.map((item) => {
          const active = isActive(item.href, item.exact);
          if (item.primary) {
            return (
              <li key={item.href} className="flex items-center justify-center">
                <Link
                  href={item.href}
                  className="flex flex-col items-center gap-1 text-[0.7rem] font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                  data-testid="bottom-nav-create"
                >
                  <span className="-mt-5 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lift ring-4 ring-background">
                    <item.icon className="size-5" aria-hidden />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          }
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-[0.7rem] font-medium outline-none transition-colors focus-visible:bg-muted",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-primary/10")}>
                  <item.icon className="size-5" aria-hidden />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Bottom padding so page content never hides behind the tab bar. */
export function BottomNavSpacer() {
  const pathname = usePathname();
  if (isFocusedFlow(pathname)) return null;
  return <div aria-hidden className="h-[calc(5rem+env(safe-area-inset-bottom))] lg:hidden" />;
}

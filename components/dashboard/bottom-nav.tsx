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
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-md lg:hidden"
    >
      <ul className="surface-float grid h-16 grid-cols-4 rounded-3xl">
        {items.map((item) => {
          const active = isActive(item.href, item.exact);
          if (item.primary) {
            return (
              <li key={item.href} className="flex items-center justify-center">
                <Link
                  href={item.href}
                  className="group flex flex-col items-center gap-1 rounded-xl text-[0.7rem] font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-testid="bottom-nav-create"
                >
                  <span className="-mt-5 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_-8px_var(--primary)] ring-4 ring-surface transition-transform duration-(--duration-base) ease-(--ease-out-quart) group-active:scale-90">
                    <item.icon className="size-5 transition-transform duration-(--duration-slow) ease-(--ease-out-quart) group-hover:rotate-90" aria-hidden />
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
                <span className="relative flex h-7 w-12 items-center justify-center">
                  {/* The highlight pops in under the active tab. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-0 rounded-full bg-primary/10 transition-[scale,opacity] duration-(--duration-slow) ease-(--ease-out-quart)",
                      active ? "scale-100 opacity-100" : "scale-50 opacity-0",
                    )}
                  />
                  <item.icon className={cn("relative size-5 transition-transform duration-(--duration-slow) ease-(--ease-out-quart)", active && "-translate-y-px scale-110")} aria-hidden />
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
  return <div aria-hidden className="h-[calc(6rem+env(safe-area-inset-bottom))] lg:hidden" />;
}

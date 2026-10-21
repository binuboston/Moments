"use client";

import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { AppLink } from "@/components/layout/app-link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { useAccount } from "@/features/auth/account-context";
import { hidesTabBar, isActivePath } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

const tab = "flex flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold outline-none focus-visible:bg-fill";

/** Phone navigation: Home, Templates, Create, Invitations and a Menu sheet. Steps aside only in the editor, which has its own bar. */
export function BottomTabs({ className }: { className?: string }) {
  const pathname = usePathname();
  const account = useAccount();
  if (hidesTabBar(pathname)) return null;
  const create = NAV_ITEMS.find((i) => i.key === "create")!;

  return (
    <nav aria-label="Primary" className={cn("fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md", className)}>
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = item.key === "invitations" ? isActivePath(pathname, item.href) && !pathname.startsWith(create.href) : isActivePath(pathname, item.href);
          return (
            <li key={item.key}>
              <AppLink href={item.href} aria-current={active ? "page" : undefined} className={cn(tab, "h-full", active ? "text-foreground" : "text-muted-foreground")} data-testid={`tab-${item.key}`}>
                <item.icon className="size-6" strokeWidth={active ? 2.5 : 2} aria-hidden />
                {item.label}
              </AppLink>
            </li>
          );
        })}
        <li>
          <MobileNav
            account={account}
            trigger={
              <button type="button" className={cn(tab, "h-full w-full text-muted-foreground")} aria-label="Open menu">
                <MenuIcon className="size-6" aria-hidden />
                Menu
              </button>
            }
          />
        </li>
      </ul>
    </nav>
  );
}

/** Space so page content never hides behind the tab bar. */
export function BottomTabsSpacer() {
  const pathname = usePathname();
  if (hidesTabBar(pathname)) return null;
  return <div aria-hidden className="h-[calc(5rem+env(safe-area-inset-bottom))] md:hidden" />;
}

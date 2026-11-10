"use client";

import { usePathname } from "next/navigation";
import { AppLink } from "@/components/layout/app-link";
import { LogoMark } from "@/components/layout/logo";
import { navItems } from "@/components/layout/nav-items";
import { SupportMenu } from "@/components/layout/support-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAccount } from "@/features/auth/account-context";
import { isNavActive } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

/**
 * Desktop navigation: a slim icon rail (logo, then Home, Create, Invitations
 * for account holders, or just Create for visitors; Settings & support at the
 * foot). Visitors log in from the top bar.
 */
export function SideRail({ className }: { className?: string }) {
  const pathname = usePathname();
  const items = navItems(useAccount()).filter((item) => !item.tabsOnly);

  return (
    <aside className={cn("fixed inset-y-0 left-0 z-40 w-[4.5rem] flex-col items-center border-r border-border bg-surface py-4", className)}>
      <LogoMark />
      <nav aria-label="Primary" className="mt-4 flex flex-1 flex-col items-center gap-2">
        {items.map((item) => {
          const isActive = isNavActive(pathname, item);
          return (
            <Tooltip key={item.key}>
              <TooltipTrigger asChild>
                <AppLink
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex size-12 items-center justify-center rounded-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "bg-foreground text-background" : "text-foreground hover:bg-fill",
                  )}
                >
                  <item.icon className="size-6" strokeWidth={isActive ? 2.4 : 2} aria-hidden />
                </AppLink>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
      <SupportMenu />
    </aside>
  );
}

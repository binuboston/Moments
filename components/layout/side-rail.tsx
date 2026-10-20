"use client";

import { usePathname } from "next/navigation";
import { AppLink } from "@/components/layout/app-link";
import { LogoMark } from "@/components/layout/logo";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { SupportMenu } from "@/components/layout/support-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isActivePath } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

/** Desktop navigation: a slim icon rail (logo, Home, Templates, Create, Invitations; Settings & support at the foot). */
export function SideRail({ className }: { className?: string }) {
  const pathname = usePathname();
  // "Create" is active only on the create page; Invitations covers the rest of /invitations.
  const active = (key: string, href: string) => (key === "invitations" ? isActivePath(pathname, href) && !pathname.startsWith(NAV_ITEMS[2].href) : isActivePath(pathname, href));

  return (
    <aside className={cn("fixed inset-y-0 left-0 z-40 w-[4.5rem] flex-col items-center border-r border-border bg-surface py-4", className)}>
      <LogoMark />
      <nav aria-label="Primary" className="mt-4 flex flex-1 flex-col items-center gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = active(item.key, item.href);
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

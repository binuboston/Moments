"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { LayoutDashboardIcon, MailIcon, MenuIcon, SettingsIcon, ShieldIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboardIcon, exact: true },
  { href: "/dashboard/invitations", label: "Invitations", icon: MailIcon },
  { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
];

export function DashboardNav({ role, className, variant = "sidebar" }: { role: "user" | "admin"; className?: string; variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const all = role === "admin" ? [...items, { href: "/admin", label: "Admin", icon: ShieldIcon }] : items;

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  const list = (
    <ul className="flex flex-col gap-1">
      {all.map((item) => {
        const active = isActive(item.href, "exact" in item ? item.exact : false);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  if (variant === "sidebar") {
    return (
      <nav aria-label="Dashboard" className={cn("py-4", className)}>
        {list}
      </nav>
    );
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open navigation">
          <MenuIcon className="size-5" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-surface p-4 shadow-lift outline-none data-[state=open]:animate-fade-in">
          <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-lg font-semibold">Menu</span>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close navigation">
                <XIcon className="size-5" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <nav aria-label="Dashboard">{list}</nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

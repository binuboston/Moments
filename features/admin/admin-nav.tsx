"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/categories", label: "Categories" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto no-scrollbar">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn("inline-flex h-10 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors md:h-9", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

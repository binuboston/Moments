"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/invitations", label: "Invitations" },
  { href: "/dashboard/settings", label: "Settings" },
];

const isActive = (pathname: string, href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

/**
 * Primary navigation in the app header (from md up; phones use the bottom tab
 * bar). One highlight glides to the active link. Until it is measured (first
 * paint, or without JavaScript) the active link draws its own highlight, so the
 * state is always correct.
 */
export function HeaderNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const list = useRef<HTMLUListElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);
  const placed = useRef(false);

  useEffect(() => {
    const ul = list.current;
    const thumb = pill.current;
    if (!ul || !thumb) return;

    const place = (animate: boolean) => {
      const active = ul.querySelector<HTMLElement>("[aria-current=page]");
      if (!active) {
        gsap.to(thumb, { opacity: 0, duration: 0.2 });
        return;
      }
      // Measure against the list itself (not each item's offsetParent).
      const box = ul.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      const to = { x: rect.left - box.left, width: rect.width, opacity: 1 };
      if (!animate || prefersReducedMotion()) gsap.set(thumb, to);
      else gsap.to(thumb, { ...to, duration: 0.45, ease: "power3.out", overwrite: true });
    };

    place(placed.current);
    placed.current = true;
    // Shown once measured; the effect only runs in the browser.
    setReady(true);

    // Web fonts and window resizes change link widths: re-measure without animating.
    const observer = new ResizeObserver(() => place(false));
    observer.observe(ul);
    void document.fonts?.ready.then(() => place(false));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <nav aria-label="Dashboard" className={className}>
      <ul ref={list} className="relative flex items-center gap-1 rounded-full bg-fill p-1">
        <span ref={pill} aria-hidden className="pointer-events-none absolute top-1 bottom-1 left-0 w-0 rounded-full bg-surface opacity-0 shadow-card" />
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-8 items-center rounded-full px-4 text-sm font-medium transition-colors duration-(--duration-base) outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  active && !ready && "bg-surface shadow-card",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

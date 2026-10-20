"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";

function isInternalNavigation(event: MouseEvent): string | null {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const anchor = (event.target as Element | null)?.closest?.("a");
  if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  const next = url.pathname + url.search;
  return next === window.location.pathname + window.location.search ? null : next;
}

function ProgressBar() {
  const bar = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = useRef(false);
  const tween = useRef<gsap.core.Tween | null>(null);

  // Start: an internal link was clicked. Creep towards 85% while the route loads.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!bar.current || !isInternalNavigation(event)) return;
      active.current = true;
      tween.current?.kill();
      gsap.set(bar.current, { autoAlpha: 1, scaleX: 0.08 });
      tween.current = gsap.to(bar.current, { scaleX: 0.85, duration: 6, ease: "power3.out" });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // Finish: the URL changed, so the new route has rendered.
  useEffect(() => {
    if (!active.current || !bar.current) return;
    active.current = false;
    tween.current?.kill();
    tween.current = gsap.to(bar.current, {
      scaleX: 1,
      duration: 0.25,
      ease: "power2.out",
      onComplete: () => {
        if (bar.current) gsap.to(bar.current, { autoAlpha: 0, duration: 0.3, delay: 0.1 });
      },
    });
  }, [pathname, searchParams]);

  return <div ref={bar} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 origin-left scale-x-0 bg-primary opacity-0" />;
}

/**
 * Thin top progress bar for client-side navigations, so every link click gets
 * immediate feedback. useSearchParams needs a Suspense boundary.
 */
export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}

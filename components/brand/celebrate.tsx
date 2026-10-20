"use client";

import { createContext, useCallback, useContext, useRef } from "react";
import { burst, type BurstOptions } from "@/components/brand/burst";
import { prefersReducedMotion } from "@/lib/motion/gsap";

/** Brand celebration colours: garnet, blush, champagne and cream. */
export const BRAND_BURST_COLORS = ["var(--primary)", "var(--color-brand-300)", "var(--accent)", "#fff6ea"];

type Origin = Element | { x: number; y: number };
type Celebrate = (origin: Origin, options?: Partial<BurstOptions>) => void;

const CelebrateContext = createContext<Celebrate>(() => {});

/**
 * Blossom bursts for app moments (choosing an occasion, going live). Renders
 * one fixed particle layer; `useCelebrate()` fires a burst from an element or
 * a viewport point. Does nothing under prefers-reduced-motion.
 */
export function CelebrationProvider({ children }: { children: React.ReactNode }) {
  const layer = useRef<HTMLDivElement>(null);

  const celebrate = useCallback<Celebrate>((origin, options) => {
    if (!layer.current || prefersReducedMotion()) return;
    let point: { x: number; y: number };
    if (origin instanceof Element) {
      const rect = origin.getBoundingClientRect();
      point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    } else {
      point = origin;
    }
    burst(layer.current, point.x, point.y, { colors: BRAND_BURST_COLORS, shape: "blossoms", ...options });
  }, []);

  return (
    <CelebrateContext.Provider value={celebrate}>
      {children}
      <div ref={layer} aria-hidden className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" />
    </CelebrateContext.Provider>
  );
}

export function useCelebrate() {
  return useContext(CelebrateContext);
}

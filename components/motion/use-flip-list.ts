"use client";

import { useLayoutEffect, useRef } from "react";
import { EASE } from "@/lib/motion/tokens";
import { Flip } from "gsap/Flip";
import { gsap, prefersReducedMotion } from "@/lib/motion/gsap";

if (typeof window !== "undefined") gsap.registerPlugin(Flip);

/**
 * Smooth layout changes for a list. Give each item `data-flip-id="<stable id>"`
 * and pass the ordered ids. When ids change, remaining items glide to their new
 * positions and new items fade in. Exits are animated by the caller before
 * removal (see animateOut).
 */
export function useFlipList<T extends HTMLElement>(ids: readonly string[]) {
  const container = useRef<T>(null);
  const state = useRef<Flip.FlipState | null>(null);
  const key = ids.join("|");

  useLayoutEffect(() => {
    const root = container.current;
    if (!root) return;
    const items = root.querySelectorAll<HTMLElement>("[data-flip-id]");
    if (state.current && !prefersReducedMotion()) {
      Flip.from(state.current, {
        targets: items,
        duration: 0.55,
        ease: EASE.ui,
        nested: true,
        onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: EASE.ui, stagger: 0.04 }),
      });
    }
    state.current = Flip.getState(items);
    const onResize = () => {
      state.current = Flip.getState(root.querySelectorAll<HTMLElement>("[data-flip-id]"));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [key]);

  return container;
}

/** Fade and shrink an element out before it is removed from the data. */
export function animateOut(el: Element | null): Promise<void> {
  if (!el || prefersReducedMotion()) return Promise.resolve();
  return new Promise((resolve) => {
    gsap.to(el, { autoAlpha: 0, scale: 0.96, duration: 0.22, ease: EASE.in, onComplete: () => resolve() });
  });
}

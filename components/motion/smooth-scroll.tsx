"use client";

import "lenis/dist/lenis.css";
import Lenis from "lenis";
import { createContext, useContext, useEffect, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion/gsap";

const LenisContext = createContext<Lenis | null>(null);

/** The active Lenis instance (null under reduced motion or before mount). */
export function useLenis() {
  return useContext(LenisContext);
}

/**
 * One Lenis instance for the subtree, driven by GSAP's ticker and synced with
 * ScrollTrigger so pinned and scrubbed animations stay frame-accurate.
 * Touch devices keep native momentum scrolling (Lenis default). Nested
 * scrollable regions keep working (allowNestedScroll). Skipped entirely under
 * prefers-reduced-motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const instance = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -80 }, allowNestedScroll: true, autoRaf: false });
    const tick = (time: number) => instance.raf(time * 1000);
    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    // Web fonts change text heights; re-measure every ScrollTrigger once they are ready.
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());
    // Assigning state in an effect is intentional: the instance only exists on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

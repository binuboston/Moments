"use client";

import { useRef } from "react";
import { DURATION, EASE } from "@/lib/motion/tokens";
import { gsap, MQ, useGSAP } from "@/lib/motion/gsap";

/**
 * Animates its content in whenever `swapKey` changes (steps, tabs, panels).
 * The first render is not animated, so pages never load in a hidden state.
 */
export function SwapTransition({ swapKey, children, className, y = 12 }: { swapKey: string | number; children: React.ReactNode; className?: string; y?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useGSAP(
    () => {
      if (first.current) {
        first.current = false;
        return;
      }
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(ref.current, { autoAlpha: 0, y }, { autoAlpha: 1, y: 0, duration: DURATION.slow, ease: EASE.ui, clearProps: "transform,opacity,visibility" });
      });
      return () => mm.revert();
    },
    { dependencies: [swapKey], scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

"use client";

import { useRef } from "react";
import { DURATION, EASE } from "@/lib/motion/tokens";
import { gsap, MQ, useGSAP } from "@/lib/motion/gsap";

/**
 * Plays the above-the-fold entrance once on load. Mark children with
 * data-hero (optionally data-hero="device" for a slower, deeper rise).
 * Targets start hidden via CSS before paint, so there is no flash of
 * content followed by a fade-in.
 */
export function HeroEntrance({ children, className, delay = 0.1 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const els = Array.from(scope.current?.querySelectorAll<HTMLElement>("[data-hero]") ?? []);
      els.forEach((el) => el.setAttribute("data-reveal-bound", ""));
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({ delay, defaults: { ease: EASE.out, duration: DURATION.reveal } });
        els.forEach((el, i) => {
          const deep = el.dataset.hero === "device";
          tl.fromTo(el, { autoAlpha: 0, y: deep ? 64 : 28 }, { autoAlpha: 1, y: 0, duration: deep ? 1.5 : DURATION.reveal }, i === 0 ? 0 : deep ? "<0.1" : "<0.08");
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}

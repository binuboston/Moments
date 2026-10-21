"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/motion/gsap";

/**
 * A hairline in the template's accent colour along the top edge, filling as
 * the guest reads down the invitation. Decorative (the browser's own scroll
 * position is the accessible equivalent); hidden under reduced motion.
 */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    });
    return () => mm.revert();
  });

  return <div ref={bar} aria-hidden data-inv-progress className="pointer-events-none fixed inset-x-0 top-0 z-[62] h-[2px] origin-left scale-x-0 bg-(--inv-accent) motion-reduce:hidden" />;
}

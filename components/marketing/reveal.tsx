"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";
import { cn } from "@/lib/utils/cn";

interface RevealProps extends React.ComponentProps<"div"> {
  /** Selector for children to stagger. Defaults to direct children. */
  stagger?: number;
  y?: number;
  once?: boolean;
}

/** Scroll-triggered fade/slide for a group of children. Respects reduced motion. */
export function Reveal({ className, children, stagger = 0.08, y = 24, once = true, ...props }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;
      const targets = ref.current.querySelectorAll<HTMLElement>("[data-reveal]");
      const items = targets.length ? targets : ref.current.children;
      gsap.fromTo(
        items,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once },
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)} {...props}>
      {children}
    </div>
  );
}

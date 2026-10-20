"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/animation/gsap";

/** Entrance timeline for the hero. Content is visible without JS; the timeline only adds motion. */
export function HeroMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return;
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from("[data-hero='eyebrow']", { autoAlpha: 0, y: 12, duration: 0.6 })
        .from("[data-hero='title'] > span", { autoAlpha: 0, y: 28, duration: 0.9, stagger: 0.08 }, "-=0.3")
        .from("[data-hero='copy']", { autoAlpha: 0, y: 16, duration: 0.7 }, "-=0.5")
        .from("[data-hero='cta'] > *", { autoAlpha: 0, y: 12, duration: 0.6, stagger: 0.08 }, "-=0.4")
        .from("[data-hero='device']", { autoAlpha: 0, y: 40, rotate: -2, duration: 1.1 }, "-=0.9")
        .from("[data-hero='float']", { autoAlpha: 0, scale: 0.9, duration: 0.8, stagger: 0.1 }, "-=0.6");
    },
    { scope: ref },
  );

  return <div ref={ref}>{children}</div>;
}

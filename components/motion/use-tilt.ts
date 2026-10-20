"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/motion/gsap";

/**
 * Subtle 3D tilt that follows the pointer. Fine pointers only (no touch) and
 * never under reduced motion. Put it on a wrapper, not on an element that
 * already uses CSS transforms (hover lifts), so the two never fight.
 */
export function useTilt<T extends HTMLElement>(max = 5) {
  const ref = useRef<T>(null);
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(`${MQ.motion} and (pointer: fine)`, () => {
        gsap.set(el, { transformPerspective: 900 });
        const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * max * 2);
          rx(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
        };
        const onLeave = () => {
          rx(0);
          ry(0);
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return ref;
}

import { gsap } from "@/lib/motion/gsap";
import type { MotionEffect } from "@/features/templates/motion/engine/types";

/**
 * `data-inv-exit` on the hero: as the guest scrolls on, it eases back (rises a
 * little slower than the page, dims and shrinks slightly), so the next section
 * seems to slide over it.
 */
export const exit: MotionEffect = {
  name: "exit",
  selector: "[data-inv-exit]",
  run(elements, { preset }) {
    elements.forEach((el) => {
      gsap.to(el, { yPercent: 18 * preset.depth, opacity: 0.35, scale: 0.97, ease: "none", scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true } });
    });
  },
};

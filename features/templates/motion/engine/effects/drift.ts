import { gsap } from "@/lib/motion/gsap";
import type { MotionEffect } from "@/features/templates/motion/engine/types";

/** `data-inv-speed="0.15"`: the element drifts against the scroll (ornaments, florals, backgrounds). */
export const drift: MotionEffect = {
  name: "drift",
  selector: "[data-inv-speed]",
  run(elements, { preset }) {
    elements.forEach((el) => {
      const speed = (Number(el.dataset.invSpeed) || 0.15) * preset.depth;
      gsap.to(el, { yPercent: speed * -100, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  },
};

import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import type { MotionEffect } from "@/features/templates/motion/engine/types";

/** `data-inv-reveal` (no variant): fades and rises into place when scrolled into view, batched so neighbours cascade. */
export const rise: MotionEffect = {
  name: "rise",
  reveal: "",
  run(elements, { preset }) {
    gsap.set(elements, { opacity: 0, y: preset.rise });
    ScrollTrigger.batch(elements, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: preset.duration, ease: preset.ease, stagger: preset.stagger, overwrite: true }),
    });
  },
};

import { gsap } from "@/lib/motion/gsap";
import type { MotionEffect } from "@/features/templates/motion/engine/types";

/** `data-inv-reveal="stagger"`: direct children rise one after another (lists, grids, cards). */
export const stagger: MotionEffect = {
  name: "stagger",
  reveal: "stagger",
  run(elements, { preset }) {
    elements.forEach((el) => {
      const items = Array.from(el.children) as HTMLElement[];
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(
        items,
        { opacity: 0, y: preset.rise * 0.6 },
        { opacity: 1, y: 0, duration: preset.duration, ease: preset.ease, stagger: Math.min(preset.stagger, 0.6 / Math.max(items.length, 1)), scrollTrigger: { trigger: el, start: "top 90%", once: true } },
      );
    });
  },
};

import { gsap } from "@/lib/motion/gsap";
import { depthScale } from "@/features/templates/motion/engine/effects/depth";
import type { MotionEffect } from "@/features/templates/motion/engine/types";

/**
 * `data-inv-reveal="mask"`: the first child (an image) unmasks upwards while
 * settling from a slight zoom. Combine with `data-inv-depth` on the same
 * element for parallax inside the frame once revealed.
 */
export const mask: MotionEffect = {
  name: "mask",
  reveal: "mask",
  run(elements, ctx) {
    elements.forEach((el) => {
      const child = el.firstElementChild as HTMLElement | null;
      gsap.set(el, { opacity: 1 });
      if (!child) return;
      const rest = depthScale(el, ctx);
      gsap.fromTo(
        child,
        { clipPath: "inset(100% 0% 0% 0%)", scale: rest + 0.15 },
        { clipPath: "inset(0% 0% 0% 0%)", scale: rest, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } },
      );
    });
  },
};

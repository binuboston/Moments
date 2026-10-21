import { gsap } from "@/lib/motion/gsap";
import type { MotionContext, MotionEffect } from "@/features/templates/motion/engine/types";

const amount = (el: HTMLElement, ctx: MotionContext) => (Number(el.dataset.invDepth) || 0.1) * ctx.preset.depth;

/** The resting zoom an image needs so its parallax travel never shows the frame's edge. */
export function depthScale(el: HTMLElement, ctx: MotionContext): number {
  return el.hasAttribute("data-inv-depth") ? 1 + amount(el, ctx) * 2 : 1;
}

/**
 * `data-inv-depth="0.1"` on an overflow-hidden frame: the image inside drifts
 * against the scroll (parallax within the frame). The value is the travel as
 * a fraction of the image height; the preset scales it.
 */
export const depth: MotionEffect = {
  name: "depth",
  selector: "[data-inv-depth]",
  run(elements, ctx) {
    elements.forEach((el) => {
      const child = el.firstElementChild as HTMLElement | null;
      if (!child) return;
      const travel = amount(el, ctx) * 100;
      if (!el.matches("[data-inv-reveal='mask']")) gsap.set(child, { scale: depthScale(el, ctx) });
      gsap.fromTo(child, { yPercent: -travel }, { yPercent: travel, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });
  },
};

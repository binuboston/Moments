import { gsap, SplitText } from "@/lib/motion/gsap";
import { STAGGER } from "@/lib/motion/tokens";
import type { MotionEffect } from "@/features/templates/motion/engine/types";

/** `data-inv-reveal="split"`: heading lines rise out of a mask. Re-splits on resize (autoSplit). */
export const split: MotionEffect = {
  name: "split",
  reveal: "split",
  run(elements, { preset }) {
    elements.forEach((el) => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        linesClass: "split-line",
        onSplit: (self) => {
          gsap.set(el, { opacity: 1 });
          return gsap.from(self.lines, { yPercent: 110, duration: preset.duration, ease: preset.settle, stagger: STAGGER.lines, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
        },
      });
    });
  },
};

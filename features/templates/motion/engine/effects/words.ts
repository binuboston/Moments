import { gsap, SplitText } from "@/lib/motion/gsap";
import type { MotionEffect } from "@/features/templates/motion/engine/types";

/**
 * `data-inv-reveal="words"`: a paragraph lights up word by word as it scrolls
 * through the view, tied to the scroll position (so it reads at the guest's
 * own pace). For short, meaningful passages: the welcome and closing message.
 */
export const words: MotionEffect = {
  name: "words",
  reveal: "words",
  run(elements) {
    elements.forEach((el) => {
      gsap.set(el, { opacity: 1 });
      const split = SplitText.create(el, { type: "words", wordsClass: "inv-word" });
      gsap.fromTo(
        split.words,
        { opacity: 0.14 },
        { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 58%", scrub: 0.6 } },
      );
    });
  },
};

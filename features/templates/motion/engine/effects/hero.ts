import { gsap, SplitText } from "@/lib/motion/gsap";
import type { MotionEffect } from "@/features/templates/motion/engine/types";

/**
 * `data-inv-hero`: the opening sequence, in DOM order, right after the guest
 * opens the invitation. `data-inv-hero="title"` arrives letter by letter or
 * word by word (the preset decides), with a soft blur.
 */
export const hero: MotionEffect = {
  name: "hero",
  selector: "[data-inv-hero]",
  run(elements, { preset }) {
    const tl = gsap.timeline({ delay: 0.05 });
    elements.forEach((el, i) => {
      const at = i === 0 ? 0 : "<0.09";
      if (el.dataset.invHero === "title") {
        const words = preset.title === "words";
        const split = SplitText.create(el, { type: words ? "words" : "words,chars", charsClass: "inv-char", wordsClass: "inv-word" });
        tl.set(el, { opacity: 1 }, at).from(
          words ? split.words : split.chars,
          {
            opacity: 0,
            yPercent: words ? 60 : 40,
            rotate: words ? 0 : 4,
            filter: "blur(6px)",
            duration: preset.duration * 1.1,
            ease: preset.ease,
            stagger: { each: words ? 0.09 : 0.028, from: "start" },
            clearProps: "filter",
          },
          "<",
        );
      } else {
        tl.fromTo(el, { opacity: 0, y: preset.rise * 0.7 }, { opacity: 1, y: 0, duration: preset.duration, ease: preset.ease }, at);
      }
    });
  },
};

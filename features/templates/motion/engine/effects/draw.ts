import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { gsap } from "@/lib/motion/gsap";
import type { MotionEffect } from "@/features/templates/motion/engine/types";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

const DRAWABLE = "path, line, polyline, polygon, circle, ellipse, rect";

/** `data-inv-reveal="draw"`: SVG strokes draw themselves in; `[data-line]` children grow from their origin. */
export const draw: MotionEffect = {
  name: "draw",
  reveal: "draw",
  run(elements) {
    elements.forEach((el) => {
      const strokes = Array.from(el.querySelectorAll<SVGElement>(DRAWABLE)).filter((s) => getComputedStyle(s).stroke !== "none");
      const lines = Array.from(el.querySelectorAll<HTMLElement>("[data-line]"));
      const t = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 92%", once: true } });
      t.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power3.out" });
      if (strokes.length) t.fromTo(strokes, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.6, ease: "power2.inOut", stagger: 0.08 }, 0);
      if (lines.length) t.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "expo.out" }, 0);
    });
  },
};

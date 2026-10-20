"use client";

import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import type { RefObject } from "react";
import { DURATION, EASE, RISE, STAGGER } from "@/lib/motion/tokens";
import { gsap, MQ, ScrollTrigger, SplitText, useGSAP } from "@/lib/motion/gsap";

if (typeof window !== "undefined") gsap.registerPlugin(DrawSVGPlugin);

const DRAWABLE = "path, line, polyline, polygon, circle, ellipse, rect";

/**
 * Declarative motion for an invitation. Templates and shared sections mark
 * elements; this hook animates them on the public page and live demo.
 *
 *   data-inv-hero            plays in the opening sequence (DOM order)
 *   data-inv-hero="title"    the main title, revealed character by character
 *   data-inv-reveal          fade + rise when scrolled into view (batched)
 *   data-inv-reveal="split"  heading lines rise out of a mask
 *   data-inv-reveal="mask"   first child (an image) unmasks upwards
 *   data-inv-reveal="draw"   SVG strokes draw in; [data-line] children grow
 *   data-inv-reveal="stagger" direct children rise one after another
 *   data-inv-speed="0.15"    parallax drift (desktop and phones)
 *
 * Until `started` is true (the guest has not opened the invitation yet) every
 * marked element is claimed and kept hidden, so the CSS failsafe does not
 * reveal content behind the cover. Reduced motion: CSS never hides anything
 * and this hook does nothing.
 */
export function useInvitationMotion(scope: RefObject<HTMLElement | null>, started: boolean) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const q = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const marked = q("[data-inv-hero], [data-inv-reveal]");
        marked.forEach((el) => el.setAttribute("data-reveal-bound", ""));
        if (!started) return;

        // Opening sequence.
        const tl = gsap.timeline({ delay: 0.05 });
        q("[data-inv-hero]").forEach((el, i) => {
          const at = i === 0 ? 0 : "<0.09";
          if (el.dataset.invHero === "title") {
            const split = SplitText.create(el, { type: "words,chars", charsClass: "inv-char" });
            tl.set(el, { opacity: 1 }, at).from(
              split.chars,
              { opacity: 0, yPercent: 40, rotate: 4, filter: "blur(6px)", duration: 1.2, ease: EASE.out, stagger: { each: 0.028, from: "start" }, clearProps: "filter" },
              "<",
            );
          } else {
            tl.fromTo(el, { opacity: 0, y: RISE * 0.7 }, { opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.out }, at);
          }
        });

        // Scroll reveals.
        // A bare attribute renders as data-inv-reveal="true".
        const ups = q("[data-inv-reveal]:not([data-inv-reveal='split'], [data-inv-reveal='mask'], [data-inv-reveal='draw'], [data-inv-reveal='stagger'])");
        gsap.set(ups, { opacity: 0, y: RISE });
        ScrollTrigger.batch(ups, {
          start: "top 90%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.out, stagger: STAGGER.items, overwrite: true }),
        });

        q("[data-inv-reveal='split']").forEach((el) => {
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            linesClass: "split-line",
            onSplit: (self) => {
              gsap.set(el, { opacity: 1 });
              return gsap.from(self.lines, { yPercent: 110, duration: DURATION.reveal, ease: EASE.out, stagger: STAGGER.lines, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
            },
          });
        });

        q("[data-inv-reveal='mask']").forEach((el) => {
          const child = el.firstElementChild as HTMLElement | null;
          gsap.set(el, { opacity: 1 });
          if (!child) return;
          gsap.fromTo(
            child,
            { clipPath: "inset(100% 0% 0% 0%)", scale: 1.15 },
            { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.6, ease: EASE.out, scrollTrigger: { trigger: el, start: "top 88%", once: true } },
          );
        });

        q("[data-inv-reveal='draw']").forEach((el) => {
          const strokes = Array.from(el.querySelectorAll<SVGElement>(DRAWABLE)).filter((s) => getComputedStyle(s).stroke !== "none");
          const lines = Array.from(el.querySelectorAll<HTMLElement>("[data-line]"));
          const t = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 92%", once: true } });
          t.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: EASE.ui });
          if (strokes.length) t.fromTo(strokes, { drawSVG: "0%" }, { drawSVG: "100%", duration: 1.6, ease: "power2.inOut", stagger: 0.08 }, 0);
          if (lines.length) t.fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: EASE.out }, 0);
        });

        q("[data-inv-reveal='stagger']").forEach((el) => {
          const items = Array.from(el.children) as HTMLElement[];
          gsap.set(el, { opacity: 1 });
          gsap.fromTo(
            items,
            { opacity: 0, y: RISE * 0.6 },
            { opacity: 1, y: 0, duration: DURATION.reveal, ease: EASE.out, stagger: Math.min(STAGGER.items, 0.6 / Math.max(items.length, 1)), scrollTrigger: { trigger: el, start: "top 90%", once: true } },
          );
        });

        q("[data-inv-speed]").forEach((el) => {
          const speed = Number(el.dataset.invSpeed) || 0;
          gsap.to(el, { yPercent: speed * -100, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });

        ScrollTrigger.refresh();
      });

      return () => mm.revert();
    },
    { scope, dependencies: [started], revertOnUpdate: true },
  );
}

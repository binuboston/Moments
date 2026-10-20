"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { DURATION, EASE, RISE, STAGGER } from "@/lib/motion/tokens";
import { gsap, MQ, ScrollTrigger, SplitText, useGSAP } from "@/lib/motion/gsap";

/**
 * Declarative scroll motion for a page subtree. Mark elements with attributes:
 *
 *   data-reveal            fade + rise when scrolled into view (batched, staggered)
 *   data-reveal="fade"     fade only
 *   data-reveal="split"    headline lines rise out of a mask (SplitText)
 *   data-reveal="mask"     child image unmasks from the bottom
 *   data-scrub-words       words brighten one by one as the block scrolls past
 *   data-speed="0.2"       parallax drift (positive = slower than scroll)
 *
 * Elements are hidden by CSS only under html.motion-ok (set before paint).
 * Every element this controller takes over gets data-reveal-bound, which
 * cancels the CSS failsafe that would otherwise unhide it after 2.5s.
 * Re-runs on route change; all tweens and triggers revert on unmount.
 */
export function RevealController({ children, className }: { children: React.ReactNode; className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const q = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T & HTMLElement>(sel));
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        // Fade/rise batches: groups entering together stagger together.
        const ups = q("[data-reveal]:not([data-reveal='split']):not([data-reveal='mask'])");
        ups.forEach((el) => el.setAttribute("data-reveal-bound", ""));
        gsap.set(ups, { autoAlpha: 0, y: (_i, el: HTMLElement) => (el.dataset.reveal === "fade" ? 0 : RISE) });
        ScrollTrigger.batch(ups, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: DURATION.reveal, ease: EASE.out, stagger: STAGGER.items, overwrite: true }),
        });

        // Split headlines.
        q("[data-reveal='split']").forEach((el) => {
          el.setAttribute("data-reveal-bound", "");
          SplitText.create(el, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            linesClass: "split-line",
            onSplit: (self) => {
              gsap.set(el, { autoAlpha: 1 });
              return gsap.from(self.lines, {
                yPercent: 105,
                duration: DURATION.reveal,
                ease: EASE.out,
                stagger: STAGGER.lines,
                scrollTrigger: { trigger: el, start: "top 90%", once: true },
              });
            },
          });
        });

        // Image unmask.
        q("[data-reveal='mask']").forEach((el) => {
          el.setAttribute("data-reveal-bound", "");
          const child = el.firstElementChild as HTMLElement | null;
          gsap.set(el, { autoAlpha: 1 });
          if (!child) return;
          gsap.fromTo(
            child,
            { clipPath: "inset(100% 0% 0% 0%)", scale: 1.12 },
            { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 1.4, ease: EASE.out, scrollTrigger: { trigger: el, start: "top 85%", once: true } },
          );
        });

        // Scroll-scrubbed word highlight.
        q("[data-scrub-words]").forEach((el) => {
          const split = SplitText.create(el, { type: "words", wordsClass: "scrub-word" });
          gsap.fromTo(
            split.words,
            { opacity: 0.18 },
            { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: el, start: "top 75%", end: "bottom 35%", scrub: 0.6 } },
          );
        });

        // Parallax drift.
        q("[data-speed]").forEach((el) => {
          const speed = Number(el.dataset.speed) || 0;
          gsap.to(el, { yPercent: speed * -100, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });

      return () => mm.revert();
    },
    { scope, dependencies: [pathname], revertOnUpdate: true },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}

"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/motion/gsap";

/**
 * On desktop the section pins and its track slides sideways as you scroll
 * (distance = track overflow). On phones the track is a native swipe row.
 */
export function HorizontalScroller({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.desktop, () => {
        const track = root.current?.querySelector<HTMLElement>("[data-track]");
        if (!track) return;
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 64);
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-col justify-center gap-10 py-24 lg:h-dvh lg:gap-14 lg:overflow-hidden lg:py-0">
      <div className="container-page">{header}</div>
      <div data-track className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:px-6 lg:snap-none lg:overflow-visible lg:px-8 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
        {children}
      </div>
    </div>
  );
}

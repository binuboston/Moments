"use client";

import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils/cn";

export interface ShowcaseSlide {
  key: string;
  name: string;
  description: string;
  href: string;
  tier: "free" | "premium";
  gradient: string;
  preview: React.ReactNode;
}

/**
 * "Meet the designs": on desktop the section pins while scrolling steps through
 * designs; the list highlights the active one and the phone crossfades.
 * On phones it becomes a swipeable row (no pinning on touch screens).
 */
export function PinnedShowcase({ slides, heading }: { slides: ShowcaseSlide[]; heading: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.desktop, () => {
        const frames = gsap.utils.toArray<HTMLElement>("[data-slide]");
        gsap.set(frames, { autoAlpha: 0, yPercent: 4 });
        gsap.set(frames[0], { autoAlpha: 1, yPercent: 0 });
        let current = 0;
        const show = (index: number) => {
          if (index === current) return;
          gsap.to(frames[current], { autoAlpha: 0, yPercent: index > current ? -4 : 4, duration: 0.5, ease: "power2.inOut", overwrite: true });
          gsap.fromTo(frames[index], { autoAlpha: 0, yPercent: index > current ? 4 : -4 }, { autoAlpha: 1, yPercent: 0, duration: 0.6, ease: "power2.out", overwrite: true });
          current = index;
          setActive(index);
        };
        ScrollTrigger.create({
          trigger: "[data-pin]",
          start: "top top",
          end: () => `+=${window.innerHeight * 0.7 * slides.length}`,
          pin: true,
          scrub: false,
          onUpdate: (self) => show(Math.min(slides.length - 1, Math.floor(self.progress * slides.length))),
        });
        return () => gsap.set(frames, { clearProps: "all" });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [slides.length] },
  );

  const current = slides[active];

  return (
    <div ref={root}>
      {/* Desktop: pinned stage */}
      <div data-pin className="hidden h-dvh flex-col pt-24 pb-24 lg:flex">
        <div className="container-page shrink-0 text-center">{heading}</div>
        {/* The phone is sized from the remaining height so it never collides with the heading. */}
        <div className="container-page grid min-h-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-12 pt-8">
          <ol className="flex flex-col gap-1" aria-label="Designs">
            {slides.map((s, i) => (
              <li key={s.key}>
                <span className={cn("block text-[clamp(1.5rem,1rem+1.4vw,2.6rem)] leading-tight font-medium tracking-tight transition-colors duration-(--duration-slow)", i === active ? "text-foreground" : "text-foreground/20")}>{s.name}</span>
              </li>
            ))}
          </ol>
          <div className="relative aspect-[9/19] h-full max-h-[44rem]">
            {slides.map((s) => (
              <div key={s.key} data-slide className="absolute inset-0">
                {s.preview}
              </div>
            ))}
          </div>
          <div className="max-w-xs justify-self-end">
            <p className="text-sm font-medium text-muted-foreground">{current.tier === "premium" ? "Premium design" : "Free design"}</p>
            <p className="mt-3 text-lg leading-snug text-pretty">{current.description}</p>
            <Link href={current.href} className="mt-6 inline-flex items-center gap-1.5 font-medium text-primary hover:underline underline-offset-4">
              Explore {current.name} <ArrowUpRightIcon className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      {/* Phones and tablets: swipeable row */}
      <ul className="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 no-scrollbar sm:px-6 lg:hidden" aria-label="Designs">
        {slides.map((s) => (
          <li key={s.key} className="w-[72vw] max-w-xs shrink-0 snap-center">
            <Link href={s.href} className="block rounded-3xl p-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring" style={{ background: s.gradient }}>
              <div className="aspect-[9/16] overflow-hidden rounded-2xl">{s.preview}</div>
            </Link>
            <p className="mt-3 font-medium">{s.name}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{s.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

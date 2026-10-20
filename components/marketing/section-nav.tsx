"use client";

import { useRef, useState } from "react";
import { useLenis } from "@/components/motion/smooth-scroll";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils/cn";

/**
 * Floating pill navigation for long pages. Appears after the hero, highlights
 * the section in view and scrolls with Lenis (native smooth scroll fallback).
 * Desktop only; phones use the regular header.
 */
export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const nav = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        gsap.set(nav.current, { autoAlpha: 0, y: 16 });
        ScrollTrigger.create({
          trigger: `#${sections[0].id}`,
          refreshPriority: -1,
          start: "top 70%",
          endTrigger: `#${sections[sections.length - 1].id}`,
          end: "bottom 30%",
          onToggle: (self) => gsap.to(nav.current, { autoAlpha: self.isActive ? 1 : 0, y: self.isActive ? 0 : 16, duration: 0.4, ease: "power3.out" }),
        });
        // Active section = the last one whose top has crossed 55% of the viewport.
        // One trigger over the whole range is robust for short final sections.
        const els = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => Boolean(el));
        const updateActive = () => {
          const line = window.innerHeight * 0.55;
          let current: string | null = null;
          for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id;
          setActive(current);
        };
        // refreshPriority -1: measure after every pin on the page has added its spacing.
        ScrollTrigger.create({ trigger: els[0], start: "top 55%", endTrigger: els[els.length - 1], end: "bottom top", refreshPriority: -1, onUpdate: updateActive, onToggle: updateActive });
        // These triggers mount before the pinned sections below them; recompute
        // positions once pin spacers exist so section boundaries are accurate.
        const refresh = gsap.delayedCall(0.05, () => {
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        });
        return () => refresh.kill();
      });
      return () => mm.revert();
    },
    { dependencies: [sections.map((s) => s.id).join()] },
  );

  const go = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { duration: 1.2 });
    else target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav ref={nav} aria-label="On this page" className="invisible fixed bottom-6 left-1/2 z-40 hidden -translate-x-1/2 opacity-0 lg:block">
      <ul className="flex items-center gap-1 rounded-full border border-stage-border bg-stage/90 p-1 text-sm text-stage-muted shadow-lift backdrop-blur-md">
        {sections.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => go(s.id)}
              aria-current={active === s.id ? "true" : undefined}
              className={cn("rounded-full px-4 py-2 transition-colors duration-(--duration-base) hover:text-stage-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", active === s.id && "bg-stage-foreground text-stage")}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

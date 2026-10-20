"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils/cn";
import { isFullPage, type MotionMode, type RenderMode } from "@/features/templates/types";
import { detectCapabilities, NO_MOTION, type MotionCapabilities } from "@/features/templates/cinematic/motion/capabilities";
import { StageContext, type Stage } from "@/features/templates/cinematic/motion/stage";

interface MotionRootProps {
  motion: MotionMode;
  mode: RenderMode;
  slug: string;
  openingEnabled: boolean;
  parallax: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const openedKey = (slug: string) => `mirth:opened:${slug}`;

function readOpened(slug: string): boolean {
  try {
    return window.sessionStorage.getItem(openedKey(slug)) === "1";
  } catch {
    return false;
  }
}

export function rememberOpened(slug: string) {
  try {
    window.sessionStorage.setItem(openedKey(slug), "1");
  } catch {
    /* storage unavailable: the cover simply shows again next visit */
  }
}

const subscribeNoop = () => () => undefined;

/**
 * The single client island for a cinematic invitation. It owns:
 * - the opening stage (cover -> opening -> open),
 * - scroll reveals via IntersectionObserver (CSS does the animating),
 * - parallax via GSAP ScrollTrigger on the public page only.
 * Sections inside stay server-rendered. Content is visible without JS because
 * hidden initial states only apply under the `motion-ready` class added here.
 */
export function MotionRoot({ motion, mode, slug, openingEnabled, parallax, className, style, children }: MotionRootProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const capabilities: MotionCapabilities = useMemo(() => (mounted ? detectCapabilities() : NO_MOTION), [mounted]);
  const animated = mounted && motion === "full";

  const initialStage: Stage = motion === "full" && openingEnabled ? "cover" : "open";
  const [stageState, setStage] = useState<Stage>(initialStage);
  // A returning guest in the same tab skips the cover (public page only).
  const skipCover = mounted && mode === "public" && stageState === "cover" && readOpened(slug);
  const stage: Stage = skipCover ? "open" : stageState;

  // Scroll reveals. Elements stay visible if IntersectionObserver is missing.
  // A MutationObserver picks up targets rendered later (live editor preview)
  // and restores the revealed class if React rewrites an element's className.
  useEffect(() => {
    const root = ref.current;
    if (!root || !animated) return;
    const revealed = new WeakSet<Element>();
    const reveal = (el: Element) => {
      revealed.add(el);
      if (!el.classList.contains("is-revealed")) el.classList.add("is-revealed");
    };
    const instant = capabilities.reduced || typeof IntersectionObserver === "undefined";
    const io = instant
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                reveal(entry.target);
                io?.unobserve(entry.target);
              }
            }
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
        );
    const scan = () => {
      root.querySelectorAll("[data-reveal]").forEach((el) => {
        if (revealed.has(el)) {
          if (!el.classList.contains("is-revealed")) el.classList.add("is-revealed");
        } else if (instant) {
          reveal(el);
        } else {
          io?.observe(el);
        }
      });
    };
    scan();
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan();
      });
    });
    mo.observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ["class"] });
    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, [animated, capabilities.reduced]);

  // Parallax: public page, capable devices, after the cover has opened.
  useEffect(() => {
    const root = ref.current;
    if (!root || !animated || !isFullPage(mode) || capabilities.lite || stage !== "open") return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("@/lib/animation/gsap").then(({ gsap }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        root.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const depth = Number(el.dataset.parallax || 1);
          gsap.fromTo(
            el,
            { yPercent: -parallax * depth },
            { yPercent: parallax * depth, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      }, root);
      cleanup = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [animated, mode, capabilities.lite, stage, parallax]);

  // Lock page scroll behind the public cover; always released when it opens or unmounts.
  useEffect(() => {
    if (!isFullPage(mode) || stage === "open") return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, [mode, stage]);

  const value = useMemo(() => ({ stage, setStage, capabilities, animated }), [stage, capabilities, animated]);

  return (
    <StageContext.Provider value={value}>
      <div
        ref={ref}
        className={cn(
          "cine relative",
          animated && !capabilities.reduced && "motion-ready",
          animated && capabilities.lite && "is-lite",
          stage !== "cover" && "hero-play",
          className,
        )}
        style={style}
        data-stage={stage}
      >
        {children}
      </div>
    </StageContext.Provider>
  );
}

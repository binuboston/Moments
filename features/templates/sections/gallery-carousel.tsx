"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion/gsap";
import { cn } from "@/lib/utils/cn";
import type { MediaItem } from "@/features/templates/types";

interface GalleryCarouselProps {
  items: MediaItem[];
  rounded: string;
  onOpen: (index: number) => void;
}

/** Each print's resting pose (degrees, px): slightly off, as if laid down by hand. Deterministic, so server and client agree. */
const POSES = [
  { r: -2.6, y: 6 },
  { r: 1.9, y: -4 },
  { r: -1.3, y: 10 },
  { r: 2.4, y: 0 },
  { r: -2.1, y: -6 },
  { r: 1.2, y: 8 },
];
const pose = (i: number) => POSES[i % POSES.length];

/** How a print looks `d` slides away from the centre (0 = centred): straight and forward when centred. */
function look(i: number, d: number) {
  const t = Math.min(1, Math.abs(d));
  const p = pose(i);
  return { rotate: p.r * t, y: p.y * t, scale: 1 - 0.1 * t, opacity: 1 - 0.35 * t };
}

const style = (i: number, d: number) => {
  const l = look(i, d);
  return { transform: `translateY(${l.y}px) rotate(${l.rotate}deg) scale(${l.scale})`, opacity: l.opacity };
};

/** Photo proportions, kept within a range so one panorama or tall shot cannot dominate. */
const ratio = (item: MediaItem) => Math.min(1.5, Math.max(0.62, item.width && item.height ? item.width / item.height : 0.8));

/**
 * Photo carousel that behaves like a hand-held stack of prints.
 *
 * - Native horizontal scrolling with CSS snap: touch keeps the platform's own
 *   momentum, and it works the same in the scaled editor preview.
 * - Mouse and pen can drag; release carries the momentum and settles on the
 *   nearest photo (GSAP tween of scrollLeft, snapping paused meanwhile).
 * - Prints rest slightly tilted and offset; the centred one straightens and
 *   comes forward. Transforms are written directly in a rAF, not React state.
 * - Tapping a side photo brings it to the centre; tapping the centred photo
 *   opens the full-screen viewer. Keyboard: arrows, Home and End on the track;
 *   focusing a photo centres it, Enter opens it.
 * - Reduced motion: no tilt, and moves are instant.
 */
export function GalleryCarousel({ items, rounded, onOpen }: GalleryCarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const settle = useRef<gsap.core.Tween | null>(null);
  const suppressClick = useRef(false);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const count = items.length;

  const slides = useCallback(() => Array.from(track.current?.querySelectorAll<HTMLElement>("[data-slide]") ?? []), []);

  /** scrollLeft that centres slide `i`, clamped to the scroll range. */
  const offsetFor = useCallback(
    (i: number) => {
      const el = track.current;
      const slide = slides()[i];
      if (!el || !slide) return 0;
      const x = slide.offsetLeft + slide.offsetWidth / 2 - el.clientWidth / 2;
      return Math.max(0, Math.min(el.scrollWidth - el.clientWidth, x));
    },
    [slides],
  );

  const nearest = useCallback(
    (scrollLeft: number) => {
      let best = 0;
      let bestDistance = Infinity;
      slides().forEach((_, i) => {
        const distance = Math.abs(offsetFor(i) - scrollLeft);
        if (distance < bestDistance) [best, bestDistance] = [i, distance];
      });
      return best;
    },
    [offsetFor, slides],
  );

  /** Side padding that lets the first and last photo reach the centre (they differ in width). */
  const pad = useCallback(() => {
    const el = track.current;
    const all = slides();
    if (!el || !all.length) return;
    const side = (slide: HTMLElement) => `${Math.max(16, (el.clientWidth - slide.offsetWidth) / 2)}px`;
    el.style.paddingInlineStart = side(all[0]);
    el.style.paddingInlineEnd = side(all[all.length - 1]);
  }, [slides]);

  /** Writes each print's pose for the current scroll position. */
  const paint = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    const centre = el.scrollLeft + el.clientWidth / 2;
    slides().forEach((slide, i) => {
      const card = cards.current[i];
      if (!card) return;
      const d = (slide.offsetLeft + slide.offsetWidth / 2 - centre) / Math.max(1, slide.offsetWidth);
      const s = style(i, reduced ? 0 : d);
      card.style.transform = s.transform;
      card.style.opacity = String(reduced ? 1 - 0.35 * Math.min(1, Math.abs(d)) : s.opacity);
    });
    const now = nearest(el.scrollLeft);
    if (now !== activeRef.current) {
      activeRef.current = now;
      setActive(now);
    }
  }, [nearest, slides]);

  const goTo = useCallback(
    (i: number) => {
      const el = track.current;
      if (!el) return;
      const index = (i + count) % count;
      settle.current?.kill();
      el.dataset.moving = "";
      settle.current = gsap.to(el, {
        scrollLeft: offsetFor(index),
        duration: prefersReducedMotion() ? 0 : 0.75,
        ease: "power3.out",
        onComplete: () => delete el.dataset.moving,
      });
    },
    [count, offsetFor],
  );

  // Repaint on scroll (once per frame) and on resize.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), paint()));
    };
    el.addEventListener("scroll", schedule, { passive: true });
    const observer = new ResizeObserver(() => {
      pad();
      schedule();
    });
    observer.observe(el);
    pad();
    schedule();
    return () => {
      el.removeEventListener("scroll", schedule);
      observer.disconnect();
      cancelAnimationFrame(frame);
      settle.current?.kill();
    };
  }, [paint, pad]);

  // Mouse and pen dragging with momentum. Touch scrolls natively.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let start: { x: number; scroll: number; id: number } | null = null;
    let dragging = false;
    let last = { x: 0, t: 0 };
    let velocity = 0;

    // The editor preview is CSS-scaled: convert screen pixels to the track's own pixels.
    const scale = () => el.getBoundingClientRect().width / Math.max(1, el.offsetWidth);

    const down = (e: PointerEvent) => {
      if (e.pointerType === "touch" || e.button !== 0) return;
      settle.current?.kill();
      start = { x: e.clientX, scroll: el.scrollLeft, id: e.pointerId };
      last = { x: e.clientX, t: e.timeStamp };
      velocity = 0;
    };
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      if (!dragging && Math.abs(dx) < 6) return;
      if (!dragging) {
        dragging = true;
        el.dataset.moving = "";
        el.dataset.dragging = "";
        el.setPointerCapture(e.pointerId);
      }
      el.scrollLeft = start.scroll - dx / scale();
      const dt = Math.max(1, e.timeStamp - last.t);
      velocity = 0.8 * ((e.clientX - last.x) / dt) + 0.2 * velocity;
      last = { x: e.clientX, t: e.timeStamp };
    };
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return;
      start = null;
      if (!dragging) return;
      dragging = false;
      delete el.dataset.dragging;
      suppressClick.current = true;
      // Throw: carry about a quarter second of momentum, then settle on the nearest print.
      const projected = el.scrollLeft - (velocity * 250) / scale();
      goTo(nearest(projected));
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [goTo, nearest]);

  const onSlideClick = (i: number) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (i === activeRef.current) onOpen(i);
    else goTo(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowLeft: activeRef.current - 1, ArrowRight: activeRef.current + 1, Home: 0, End: count - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const target = Math.max(0, Math.min(count - 1, keys[e.key]));
    goTo(target);
    if (e.target !== track.current) slides()[target]?.querySelector("button")?.focus({ preventScroll: true });
  };

  return (
    <div role="region" aria-roledescription="carousel" aria-label="Photo gallery" className="@container relative" data-inv-reveal data-gallery-carousel>
      <div
        ref={track}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label="Photos. Use the arrow keys to move between them."
        className={cn(
          "no-scrollbar relative -mx-6 flex snap-x snap-mandatory items-center gap-4 overflow-x-auto overscroll-x-contain px-[12%] py-8 outline-none sm:-mx-10 sm:gap-6",
          // Where the design's column ends, photos fade out instead of being cut off.
          "sm:[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]",
          "cursor-grab data-[dragging]:cursor-grabbing data-[dragging]:select-none data-[moving]:snap-none",
          "focus-visible:ring-2 focus-visible:ring-(--inv-accent) focus-visible:ring-inset",
        )}
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            data-slide
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="h-72 max-w-[78cqw] shrink-0 snap-center sm:h-96"
            style={{ aspectRatio: ratio(item) }}
          >
            <div
              ref={(node) => {
                cards.current[i] = node;
              }}
              className="size-full will-change-transform"
              style={style(i, i)}
            >
              <button
                type="button"
                onClick={() => onSlideClick(i)}
                onFocus={() => i !== activeRef.current && goTo(i)}
                draggable={false}
                aria-label={`${item.alt || `Photo ${i + 1}`}. ${i === active ? "Open full screen" : "Bring to the front"}`}
                className={cn(
                  "relative block size-full overflow-hidden bg-(--inv-surface) shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)] ring-1 ring-black/5 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--inv-accent)",
                  rounded,
                )}
              >
                <Image src={item.url} alt="" fill sizes="(min-width: 640px) 40vw, 78vw" className="pointer-events-none object-cover select-none" draggable={false} loading={i < 2 ? "eager" : "lazy"} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {count > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-4">
          <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous photo" className="grid size-10 place-items-center rounded-full border border-(--inv-border) text-(--inv-text) transition-colors hover:bg-(--inv-text)/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--inv-accent)">
            <ChevronLeftIcon className="size-4" aria-hidden />
          </button>
          <div className="flex min-w-24 flex-col items-center gap-2">
            <span className="text-xs tracking-[0.2em] tabular-nums text-(--inv-muted)" aria-live="polite" aria-atomic>
              <span className="sr-only">Photo </span>
              {String(active + 1).padStart(2, "0")}
              <span aria-hidden> / </span>
              <span className="sr-only"> of </span>
              {String(count).padStart(2, "0")}
            </span>
            <span aria-hidden className="h-px w-24 overflow-hidden bg-(--inv-border)">
              <span className="block h-full origin-left bg-(--inv-accent) transition-transform duration-500 ease-out" style={{ transform: `scaleX(${(active + 1) / count})` }} />
            </span>
          </div>
          <button type="button" onClick={() => goTo(active + 1)} aria-label="Next photo" className="grid size-10 place-items-center rounded-full border border-(--inv-border) text-(--inv-text) transition-colors hover:bg-(--inv-text)/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--inv-accent)">
            <ChevronRightIcon className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}

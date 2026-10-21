"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useLenis } from "@/components/motion/smooth-scroll";
import type { MediaItem } from "@/features/templates/types";

interface LightboxProps {
  items: MediaItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

/** Horizontal distance (px) that counts as a swipe to the next or previous photo. */
const SWIPE = 50;

/**
 * Full-screen photo viewer shared by every gallery layout. Arrow keys, swipe
 * and Escape. Smooth scrolling pauses while it is open, so the page behind
 * stays put. Neighbouring photos are preloaded for instant stepping.
 */
export function Lightbox({ items, index, onIndexChange }: LightboxProps) {
  const lenis = useLenis();
  const open = index !== null;
  const current = index === null ? null : items[index];
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const step = (delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + items.length) % items.length);
  };

  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    return () => lenis?.start();
  }, [open, lenis]);

  const neighbours = index === null || items.length < 2 ? [] : [items[(index + 1) % items.length], items[(index - 1 + items.length) % items.length]];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onIndexChange(null)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[80] flex touch-pan-y items-center justify-center p-4 outline-none data-[state=open]:animate-pop-in data-[state=closed]:animate-fade-out"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
          onPointerDown={(e) => {
            if (e.pointerType === "touch") swipe.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const start = swipe.current;
            swipe.current = null;
            if (!start) return;
            const dx = e.clientX - start.x;
            if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(e.clientY - start.y)) step(dx < 0 ? 1 : -1);
          }}
        >
          <DialogPrimitive.Title className="sr-only">Photo gallery</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {index !== null ? `Photo ${index + 1} of ${items.length}. Use the arrow keys or swipe to move between photos.` : ""}
          </DialogPrimitive.Description>
          {current ? (
            <figure key={current.id} className="relative h-full max-h-[85vh] w-full max-w-4xl animate-fade-in">
              <Image src={current.url} alt={current.alt} fill sizes="100vw" className="object-contain" priority />
            </figure>
          ) : null}
          {/* Preload neighbours so stepping is instant. */}
          <div hidden>
            {neighbours.map((m) => (
              <Image key={m.id} src={m.url} alt="" width={16} height={16} sizes="100vw" priority />
            ))}
          </div>
          {index !== null && items.length > 1 ? (
            <p className="absolute top-5 left-5 text-xs tracking-[0.2em] text-white/70 tabular-nums" aria-hidden>
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </p>
          ) : null}
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white" aria-label="Close gallery">
            <XIcon className="size-5" />
          </DialogPrimitive.Close>
          {items.length > 1 ? (
            <>
              <button type="button" onClick={() => step(-1)} className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white" aria-label="Previous photo">
                <ChevronLeftIcon className="size-6" />
              </button>
              <button type="button" onClick={() => step(1)} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white" aria-label="Next photo">
                <ChevronRightIcon className="size-6" />
              </button>
            </>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

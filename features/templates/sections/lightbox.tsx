"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import Image from "next/image";
import type { MediaItem } from "@/features/templates/types";

interface LightboxProps {
  items: MediaItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

/** Fullscreen photo viewer shared by every gallery layout. Arrow keys and Escape supported. */
export function Lightbox({ items, index, onIndexChange }: LightboxProps) {
  const current = index === null ? null : items[index];
  const step = (delta: number) => {
    if (index === null) return;
    onIndexChange((index + delta + items.length) % items.length);
  };

  return (
    <DialogPrimitive.Root open={index !== null} onOpenChange={(o) => !o && onIndexChange(null)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/90 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 outline-none data-[state=open]:animate-pop-in data-[state=closed]:animate-fade-out"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
        >
          <DialogPrimitive.Title className="sr-only">Photo gallery</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {index !== null ? `Photo ${index + 1} of ${items.length}. Use the arrow keys to move between photos.` : ""}
          </DialogPrimitive.Description>
          {current ? (
            <div className="relative h-full max-h-[85vh] w-full max-w-4xl">
              <Image src={current.url} alt={current.alt} fill sizes="100vw" className="object-contain" priority />
            </div>
          ) : null}
          <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white" aria-label="Close gallery">
            <XIcon className="size-5" />
          </DialogPrimitive.Close>
          {items.length > 1 ? (
            <>
              <button type="button" onClick={() => step(-1)} className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Previous photo">
                <ChevronLeftIcon className="size-6" />
              </button>
              <button type="button" onClick={() => step(1)} className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Next photo">
                <ChevronRightIcon className="size-6" />
              </button>
            </>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

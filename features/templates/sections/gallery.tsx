"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Lightbox } from "@/features/templates/sections/lightbox";
import type { MediaItem } from "@/features/templates/types";

interface GalleryProps {
  items: MediaItem[];
  className?: string;
  rounded?: string;
}

export function Gallery({ items, className, rounded = "rounded-xl" }: GalleryProps) {
  const [index, setIndex] = useState<number | null>(null);
  if (items.length === 0) return null;

  return (
    <>
      <ul className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3", className)}>
        {items.map((item, i) => (
          <li key={item.id} className={cn(i === 0 && items.length >= 5 && "col-span-2 row-span-2")}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className={cn("group relative block aspect-square w-full overflow-hidden bg-(--inv-surface) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--inv-accent)", rounded)}
              aria-label={`Open photo ${i + 1} of ${items.length}`}
            >
              <Image
                src={item.url}
                alt={item.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
                loading="lazy"
              />
            </button>
          </li>
        ))}
      </ul>

      <Lightbox items={items} index={index} onIndexChange={setIndex} />
    </>
  );
}

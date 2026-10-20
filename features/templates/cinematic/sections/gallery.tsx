"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { MediaItem } from "@/features/templates/types";
import type { ArtDirection } from "@/features/templates/cinematic/art-direction";
import { Lightbox } from "@/features/templates/sections/lightbox";

/** Aspect ratio from stored dimensions so the layout never shifts while images load. */
const ratio = (m: MediaItem, fallback: number) => (m.width && m.height ? m.width / m.height : fallback);

function Tile({ item, index, total, onOpen, className, aspect, sizes }: { item: MediaItem; index: number; total: number; onOpen: (i: number) => void; className?: string; aspect: number; sizes: string }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className={cn("group relative block w-full overflow-hidden bg-(--inv-surface) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--inv-accent)", className)}
      style={{ aspectRatio: aspect }}
      aria-label={`Open photo ${index + 1} of ${total}${item.alt ? `: ${item.alt}` : ""}`}
      data-reveal="mask"
    >
      <Image src={item.url} alt={item.alt} fill sizes={sizes} loading="lazy" className="object-cover" />
    </button>
  );
}

export function CinematicGallery({ items, layout }: { items: MediaItem[]; layout: ArtDirection["layouts"]["gallery"] }) {
  const [index, setIndex] = useState<number | null>(null);
  if (items.length === 0) return null;
  const total = items.length;

  let body: React.ReactNode;
  if (layout === "filmstrip") {
    body = (
      <div className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 no-scrollbar @2xl:-mx-10 @2xl:px-10" role="list" aria-label="Photos">
        {items.map((item, i) => (
          <div key={item.id} role="listitem" className="w-[72cqw] max-w-sm shrink-0 snap-center @2xl:w-[26rem]">
            <Tile item={item} index={i} total={total} onOpen={setIndex} aspect={ratio(item, 3 / 4) > 1 ? 4 / 3 : 3 / 4} sizes="(min-width: 640px) 416px, 72vw" />
          </div>
        ))}
      </div>
    );
  } else if (layout === "columns") {
    const cols: MediaItem[][] = [[], [], []];
    items.forEach((item, i) => cols[i % 3].push(item));
    body = (
      <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-3 @2xl:gap-5">
        {cols.map((col, c) => (
          <div key={c} className={cn("flex flex-col gap-3 @2xl:gap-5", c === 1 && "@2xl:pt-16", c === 2 && "hidden @2xl:flex")}>
            {col.map((item) => {
              const i = items.indexOf(item);
              return <Tile key={item.id} item={item} index={i} total={total} onOpen={setIndex} aspect={ratio(item, 4 / 5)} sizes="(min-width: 640px) 33vw, 50vw" />;
            })}
          </div>
        ))}
        {/* On phones the third column folds into the first two. */}
        <div className="col-span-2 grid grid-cols-2 gap-3 @2xl:hidden">
          {cols[2].map((item) => {
            const i = items.indexOf(item);
            return <Tile key={item.id} item={item} index={i} total={total} onOpen={setIndex} aspect={ratio(item, 4 / 5)} sizes="50vw" />;
          })}
        </div>
      </div>
    );
  } else {
    // Editorial mosaic: one tall feature, then alternating pairs.
    body = (
      <div className="grid grid-cols-6 gap-3 @2xl:gap-5">
        {items.map((item, i) => {
          const pattern = i % 5;
          const span = pattern === 0 ? "col-span-6 @2xl:col-span-4 @2xl:row-span-2" : pattern === 1 || pattern === 2 ? "col-span-3 @2xl:col-span-2" : "col-span-3";
          const aspect = pattern === 0 ? 4 / 5 : pattern === 3 ? 4 / 3 : 3 / 4;
          return (
            <div key={item.id} className={span}>
              <Tile item={item} index={i} total={total} onOpen={setIndex} aspect={aspect} className={pattern === 0 ? "@2xl:h-full" : undefined} sizes={pattern === 0 ? "(min-width: 640px) 66vw, 100vw" : "(min-width: 640px) 33vw, 50vw"} />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {body}
      <Lightbox items={items} index={index} onIndexChange={setIndex} />
    </>
  );
}

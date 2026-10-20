import Image from "next/image";
import type { MediaItem } from "@/features/templates/types";

/**
 * Image for mask-reveal containers. Layering keeps each property owned by one
 * system: the outer layer is clipped/scaled by the CSS reveal, the inner layer
 * is translated by GSAP parallax (with 8% bleed so edges never show).
 */
export function ParallaxImage({ photo, alt, sizes, depth = 1, eager = false }: { photo: MediaItem; alt: string; sizes: string; depth?: number; eager?: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -inset-y-[8%] inset-x-0" data-parallax={depth}>
        <Image src={photo.url} alt={alt} fill sizes={sizes} className="object-cover" priority={eager} loading={eager ? undefined : "lazy"} />
      </div>
    </div>
  );
}

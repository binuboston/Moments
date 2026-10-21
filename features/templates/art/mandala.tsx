import { cn } from "@/lib/utils/cn";

/**
 * Kolam-style mandala in fine strokes of the current colour: petal rings and
 * dotted circles. Marked to draw itself in on the guest page.
 */
export function Mandala({ className, draw = true }: { className?: string; draw?: boolean }) {
  const ring = (count: number, r: number, len: number, width: number) =>
    Array.from({ length: count }).map((_, i) => (
      <path key={`${r}-${i}`} d={`M0 ${-r} C ${width} ${-r - len * 0.4}, ${width} ${-r - len * 0.8}, 0 ${-r - len} C ${-width} ${-r - len * 0.8}, ${-width} ${-r - len * 0.4}, 0 ${-r}Z`} transform={`rotate(${(360 / count) * i})`} />
    ));
  return (
    <svg viewBox="-100 -100 200 200" className={cn("text-(--inv-accent)", className)} fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden data-inv-reveal={draw ? "draw" : undefined}>
      <circle r="8" />
      <circle r="14" strokeDasharray="1 3" />
      {ring(8, 16, 22, 7)}
      <circle r="42" />
      {ring(16, 44, 20, 5)}
      <circle r="68" strokeDasharray="1 4" />
      {ring(24, 70, 18, 3.5)}
      <circle r="92" />
    </svg>
  );
}

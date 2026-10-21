import { cn } from "@/lib/utils/cn";

const MARIGOLD = ["#f59e0b", "#ea580c", "#fbbf24"];

/** One marigold: layered petal rings in warm tones (fixed colours: it is an illustration). */
function Marigold({ x, y, r, tone }: { x: number; y: number; r: number; tone: number }) {
  const c = MARIGOLD[tone % MARIGOLD.length];
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse key={i} rx={r * 0.42} ry={r} fill={c} opacity={0.9} transform={`rotate(${i * 30}) translate(0 ${-r * 0.35})`} />
      ))}
      <circle r={r * 0.55} fill={MARIGOLD[(tone + 1) % MARIGOLD.length]} />
      <circle r={r * 0.22} fill="#9a3412" opacity={0.7} />
    </g>
  );
}

/** Mango leaf hanging from the garland. */
function Leaf({ x, y, flip }: { x: number; y: number; flip?: boolean }) {
  return <path d="M0 0 C 7 10, 7 26, 0 38 C -7 26, -7 10, 0 0Z" fill="#3f6212" transform={`translate(${x} ${y}) rotate(${flip ? 8 : -8})`} opacity={0.9} />;
}

/**
 * Toran: a marigold garland strung across the top of the page, with mango
 * leaves hanging between the flowers. Decorative; gently sways with motion
 * allowed.
 */
export function MarigoldToran({ className }: { className?: string }) {
  const W = 400;
  const n = 11;
  const sag = (i: number) => 8 + Math.sin((i / (n - 1)) * Math.PI) * 18;
  return (
    <svg viewBox={`0 0 ${W} 70`} preserveAspectRatio="none" className={cn("h-16 w-full sm:h-20", className)} aria-hidden>
      <path d={`M0 6 Q ${W / 2} 52 ${W} 6`} stroke="#9a3412" strokeWidth="1.2" fill="none" opacity={0.6} />
      {Array.from({ length: n - 1 }).map((_, i) => {
        const x = ((i + 0.5) / (n - 1)) * W;
        return <Leaf key={`l${i}`} x={x} y={sag(i + 0.5) + 4} flip={i % 2 === 0} />;
      })}
      {Array.from({ length: n }).map((_, i) => (
        <Marigold key={i} x={(i / (n - 1)) * W} y={sag(i)} r={9} tone={i} />
      ))}
    </svg>
  );
}

import { cn } from "@/lib/utils/cn";

/**
 * Procedural botanical art. Shapes are generated from a few parameters so the
 * same primitives can be recomposed per template without shipping raster
 * files. Colours come from palette custom properties (--inv-bloom, --inv-leaf,
 * --inv-accent) so every palette recolours the artwork automatically.
 * All art is decorative: aria-hidden, no focusable content.
 */

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Tiny deterministic PRNG so server and client render identical SVG. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Leaf({ x, y, length, angle, width = 0.28, vein = true }: { x: number; y: number; length: number; angle: number; width?: number; vein?: boolean }) {
  const w = length * width;
  const d = `M0 0 C ${r2(w)} ${r2(-length * 0.2)} ${r2(w * 0.9)} ${r2(-length * 0.7)} 0 ${r2(-length)} C ${r2(-w * 0.7)} ${r2(-length * 0.72)} ${r2(-w * 0.95)} ${r2(-length * 0.22)} 0 0Z`;
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(angle)})`}>
      <path d={d} fill="var(--inv-leaf)" fillOpacity={0.42} stroke="var(--inv-leaf)" strokeOpacity={0.85} strokeWidth={0.7} />
      {vein ? <path d={`M0 0 Q ${r2(w * 0.12)} ${r2(-length * 0.5)} 0 ${r2(-length * 0.9)}`} stroke="var(--inv-leaf)" strokeOpacity={0.7} strokeWidth={0.5} fill="none" /> : null}
    </g>
  );
}

/** Marigold: dense ruffled rings of tiny petals. */
export function Marigold({ x, y, r, tone = "var(--inv-accent)" }: { x: number; y: number; r: number; tone?: string }) {
  const rings = [1, 0.78, 0.55, 0.32];
  return (
    <g transform={`translate(${r2(x)} ${r2(y)})`}>
      <circle r={r} fill={tone} fillOpacity={0.22} />
      {rings.map((k, ri) => {
        const count = Math.max(6, Math.round(18 * k));
        return (
          <g key={ri}>
            {Array.from({ length: count }, (_, i) => {
              const a = (i / count) * Math.PI * 2 + ri * 0.5;
              const pr = r * k * 0.78;
              return <circle key={i} cx={r2(Math.cos(a) * pr)} cy={r2(Math.sin(a) * pr)} r={r2(r * 0.2 * (1.1 - k * 0.3))} fill={tone} fillOpacity={0.35 + ri * 0.14} />;
            })}
          </g>
        );
      })}
    </g>
  );
}

/** Peony / garden rose: layered translucent cupped petals with ink edges. */
export function Rose({ x, y, r, tone = "var(--inv-bloom)" }: { x: number; y: number; r: number; tone?: string }) {
  const layers = [
    { count: 7, k: 1, op: 0.32, rot: 0 },
    { count: 6, k: 0.74, op: 0.45, rot: 18 },
    { count: 5, k: 0.5, op: 0.6, rot: 40 },
  ];
  return (
    <g transform={`translate(${r2(x)} ${r2(y)})`}>
      {layers.map((layer, li) => (
        <g key={li}>
          {Array.from({ length: layer.count }, (_, i) => {
            const pr = r * layer.k;
            const d = `M0 0 C ${r2(pr * 0.62)} ${r2(-pr * 0.28)} ${r2(pr * 0.58)} ${r2(-pr * 0.98)} 0 ${r2(-pr * 1.02)} C ${r2(-pr * 0.58)} ${r2(-pr * 0.98)} ${r2(-pr * 0.62)} ${r2(-pr * 0.28)} 0 0Z`;
            return <path key={i} d={d} transform={`rotate(${r2((360 / layer.count) * i + layer.rot)})`} fill={tone} fillOpacity={layer.op} stroke={tone} strokeOpacity={0.9} strokeWidth={0.6} />;
          })}
        </g>
      ))}
      <circle r={r2(r * 0.14)} fill="var(--inv-accent)" fillOpacity={0.9} />
    </g>
  );
}

function Bud({ x, y, angle, tone = "var(--inv-bloom)" }: { x: number; y: number; angle: number; tone?: string }) {
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(angle)})`}>
      <path d="M0 0 L0 -26" stroke="var(--inv-leaf)" strokeWidth={0.8} />
      <ellipse cx={0} cy={-31} rx={4.2} ry={6.5} fill={tone} fillOpacity={0.55} stroke={tone} strokeWidth={0.6} />
    </g>
  );
}

/** Airy hand-tied bouquet: two peonies, marigolds, buds, slender leaves and gold baby's breath. */
export function Bouquet({ className, seed = 7, flip = false }: { className?: string; seed?: number; flip?: boolean }) {
  const rand = seeded(seed);
  const leaves = Array.from({ length: 11 }, (_, i) => ({ x: 150 + (rand() - 0.5) * 30, y: 205 - rand() * 25, length: 62 + rand() * 46, angle: -78 + (i / 10) * 156 + (rand() - 0.5) * 10 }));
  const dots = Array.from({ length: 16 }, () => ({ x: 80 + rand() * 140, y: 60 + rand() * 120, r: 1.1 + rand() * 1.6 }));
  return (
    <svg viewBox="0 0 300 300" className={cn("pointer-events-none select-none", flip && "-scale-x-100", className)} aria-hidden focusable="false">
      {leaves.map((l, i) => (
        <Leaf key={i} {...l} />
      ))}
      <path d="M150 298 C 149 262 151 236 150 212" stroke="var(--inv-leaf)" strokeWidth={1.2} fill="none" />
      <Bud x={150} y={196} angle={-34} />
      <Bud x={152} y={196} angle={28} tone="var(--inv-accent)" />
      <Rose x={146} y={142} r={30} />
      <Rose x={196} y={166} r={20} tone="var(--inv-accent)" />
      <Marigold x={106} y={168} r={18} />
      <Marigold x={182} y={112} r={12} tone="var(--inv-bloom)" />
      {dots.map((d, i) => (
        <circle key={i} cx={r2(d.x)} cy={r2(d.y)} r={r2(d.r)} fill="var(--inv-accent)" fillOpacity={0.75} />
      ))}
    </svg>
  );
}

/** Marigold and mango-leaf toran (door garland) hanging across the top of a section. */
export function Toran({ className, strands = 9 }: { className?: string; strands?: number }) {
  const width = 600;
  const step = width / (strands + 1);
  return (
    <svg viewBox={`0 0 ${width} 150`} preserveAspectRatio="xMidYMin meet" className={cn("pointer-events-none select-none", className)} aria-hidden focusable="false">
      <path d={`M0 14 Q ${width / 2} 44 ${width} 14`} stroke="var(--inv-accent)" strokeWidth={1.4} fill="none" />
      {Array.from({ length: strands }, (_, i) => {
        const x = step * (i + 1);
        const sag = 14 + 30 * Math.sin((Math.PI * (i + 1)) / (strands + 1));
        const len = i % 2 === 0 ? 4 : 3;
        return (
          <g key={i}>
            <path d={`M${r2(x)} ${r2(sag)} L${r2(x)} ${r2(sag + len * 22)}`} stroke="var(--inv-accent)" strokeOpacity={0.5} strokeWidth={0.8} />
            {Array.from({ length: len }, (_, j) => (
              <Marigold key={j} x={x} y={sag + 10 + j * 22} r={9 - j} tone={j % 2 === 0 ? "var(--inv-accent)" : "var(--inv-bloom)"} />
            ))}
            {i % 2 === 1 ? <Leaf x={x} y={sag + 2} length={26} angle={180} width={0.32} vein={false} /> : null}
          </g>
        );
      })}
    </svg>
  );
}

/** Slender sprig for margins, drawn as fine line with filled leaves. */
export function Sprig({ className, leaves = 7, seed = 3 }: { className?: string; leaves?: number; seed?: number }) {
  const rand = seeded(seed);
  return (
    <svg viewBox="0 0 120 320" className={cn("pointer-events-none select-none", className)} aria-hidden focusable="false">
      <path d="M60 318 C 70 240 40 170 64 90 C 72 60 66 30 60 4" stroke="var(--inv-leaf)" strokeWidth={1.6} fill="none" pathLength={1} data-draw />
      {Array.from({ length: leaves }, (_, i) => {
        const t = (i + 1) / (leaves + 1);
        const y = 318 - t * 300;
        const side = i % 2 === 0 ? 1 : -1;
        return <Leaf key={i} x={60 + side * 2} y={y} length={30 + rand() * 18} angle={side * (40 + rand() * 20)} width={0.34} />;
      })}
    </svg>
  );
}

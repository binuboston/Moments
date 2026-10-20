import { cn } from "@/lib/utils/cn";

/** Fine gold divider with a lotus at the centre. Paths use pathLength=1 so CSS can draw them in. */
export function LotusDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 28" className={cn("h-7 w-60 max-w-full text-(--inv-accent)", className)} aria-hidden focusable="false" data-reveal="draw">
      <path d="M2 14 H96" stroke="currentColor" strokeWidth={0.8} fill="none" pathLength={1} />
      <path d="M144 14 H238" stroke="currentColor" strokeWidth={0.8} fill="none" pathLength={1} />
      <g fill="none" stroke="currentColor" strokeWidth={0.9}>
        <path d="M120 4 C 126 10 126 18 120 24 C 114 18 114 10 120 4Z" pathLength={1} />
        <path d="M120 24 C 112 22 104 18 101 12 C 109 12 116 16 120 24Z" pathLength={1} />
        <path d="M120 24 C 128 22 136 18 139 12 C 131 12 124 16 120 24Z" pathLength={1} />
      </g>
      <circle cx={100} cy={14} r={1.4} fill="currentColor" />
      <circle cx={140} cy={14} r={1.4} fill="currentColor" />
    </svg>
  );
}

/** Mughal-inspired arch outline used to frame the hero. Drawn in with stroke-dashoffset. */
export function ArchFrame({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 560" preserveAspectRatio="none" className={cn("pointer-events-none text-(--inv-accent)", className)} aria-hidden focusable="false" data-hero="draw">
      <path d="M20 556 V 210 C 20 120 110 60 200 8 C 290 60 380 120 380 210 V 556" fill="none" stroke="currentColor" strokeWidth={1} pathLength={1} vectorEffect="non-scaling-stroke" />
      <path d="M34 556 V 214 C 34 132 116 76 200 26 C 284 76 366 132 366 214 V 556" fill="none" stroke="currentColor" strokeOpacity={0.45} strokeWidth={0.75} pathLength={1} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Thin double rule frame with corner diamonds (Royal Night). */
export function FineFrame({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 560" preserveAspectRatio="none" className={cn("pointer-events-none text-(--inv-accent)", className)} aria-hidden focusable="false" data-hero="draw">
      <rect x={10} y={10} width={380} height={540} fill="none" stroke="currentColor" strokeWidth={1} pathLength={1} vectorEffect="non-scaling-stroke" />
      <rect x={22} y={22} width={356} height={516} fill="none" stroke="currentColor" strokeOpacity={0.5} strokeWidth={0.75} pathLength={1} vectorEffect="non-scaling-stroke" />
      {[
        [10, 10],
        [390, 10],
        [10, 550],
        [390, 550],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 4} y={y - 4} width={8} height={8} transform={`rotate(45 ${x} ${y})`} fill="currentColor" />
      ))}
    </svg>
  );
}

/** Wax seal with scalloped edge and monogram. */
export function WaxSeal({ monogram, className }: { monogram: string; className?: string }) {
  const scallops = 22;
  const points = Array.from({ length: scallops * 2 }, (_, i) => {
    const a = (i / (scallops * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 48 : 44;
    return `${Math.round((50 + Math.cos(a) * r) * 100) / 100},${Math.round((50 + Math.sin(a) * r) * 100) / 100}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={cn("drop-shadow-[0_6px_10px_rgb(0_0_0/0.18)]", className)} aria-hidden focusable="false">
      <polygon points={points} fill="var(--inv-bloom)" />
      <circle cx={50} cy={50} r={36} fill="none" stroke="var(--inv-bg)" strokeOpacity={0.55} strokeWidth={1} />
      <circle cx={50} cy={50} r={33} fill="none" stroke="var(--inv-bg)" strokeOpacity={0.3} strokeWidth={0.6} />
      <text x={50} y={50} textAnchor="middle" dominantBaseline="central" fill="var(--inv-bg)" fontSize={monogram.length > 3 ? 18 : 24} style={{ fontFamily: "var(--inv-font-script)" }}>
        {monogram}
      </text>
    </svg>
  );
}

/** Subtle paper grain using an inline SVG noise filter (no image request). */
export function PaperGrain({ className, opacity = 0.08 }: { className?: string; opacity?: number }) {
  return (
    <svg className={cn("pointer-events-none absolute inset-0 h-full w-full mix-blend-multiply", className)} aria-hidden focusable="false" style={{ opacity }}>
      <filter id="cine-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#cine-grain)" />
    </svg>
  );
}

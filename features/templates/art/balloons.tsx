import { cn } from "@/lib/utils/cn";

const BALLOONS = [
  { x: "4%", y: "10%", s: 4.5, c: "var(--inv-accent)", d: "0s", speed: 0.35, r: -8 },
  { x: "16%", y: "46%", s: 3.2, c: "var(--inv-c2)", d: "-1.2s", speed: 0.5, r: 6 },
  { x: "80%", y: "6%", s: 5, c: "var(--inv-c3)", d: "-0.6s", speed: 0.3, r: 10 },
  { x: "88%", y: "50%", s: 3.4, c: "var(--inv-accent)", d: "-2s", speed: 0.55, r: -4 },
  { x: "66%", y: "64%", s: 2.6, c: "var(--inv-c2)", d: "-1.6s", speed: 0.6, r: 12 },
];

/** A single balloon with its knot, highlight and a curling string. */
export function Balloon({ color, className, style }: { color: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 120" className={className} style={style} aria-hidden>
      <path d="M30 4 C 50 4, 56 24, 54 38 C 52 56, 38 70, 30 72 C 22 70, 8 56, 6 38 C 4 24, 10 4, 30 4Z" fill={color} />
      <path d="M17 18 C 20 12, 26 10, 30 10" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M26 72 L34 72 L30 78Z" fill={color} />
      <path d="M30 78 C 24 88, 36 96, 30 106 C 26 112, 32 116, 30 120" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

/** A loose bunch of balloons around the hero: each drifts with the scroll and bobs gently. */
export function BalloonCloud({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 text-(--inv-text)", className)} aria-hidden>
      {BALLOONS.map((b, i) => (
        <div key={i} className="absolute" style={{ left: b.x, top: b.y }} data-inv-speed={b.speed}>
          <Balloon color={b.c} className="motion-safe:animate-[balloon-bob_5s_ease-in-out_infinite]" style={{ width: `${b.s}rem`, rotate: `${b.r}deg`, animationDelay: b.d }} />
        </div>
      ))}
    </div>
  );
}

import { cn } from "@/lib/utils/cn";

/*
 * The Mirth blossom: a six-petal flower used across the product (invitation
 * opening card, celebration bursts, dashboard). One geometry, two outputs:
 * a React component for markup and an SVG string for particles that GSAP
 * creates imperatively.
 */

const PETAL_ANGLES = [0, 60, 120, 180, 240, 300];

/** SVG markup string (for DOM particles). Petals use currentColor. */
export function blossomMarkup(centre = "rgb(255 255 255 / 0.85)"): string {
  const petals = PETAL_ANGLES.map((r) => `<ellipse cx="0" cy="-5.2" rx="2.3" ry="4.6" transform="rotate(${r})"/>`).join("");
  return `<svg viewBox="-11 -11 22 22" width="100%" height="100%" aria-hidden="true"><g fill="currentColor">${petals}</g><circle r="1.9" fill="${centre}"/></svg>`;
}

export function Blossom({ className, centre = "rgb(255 255 255 / 0.85)", style }: { className?: string; centre?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="-11 -11 22 22" className={cn("size-4", className)} style={style} aria-hidden>
      <g fill="currentColor">
        {PETAL_ANGLES.map((r) => (
          <ellipse key={r} cx="0" cy="-5.2" rx="2.3" ry="4.6" transform={`rotate(${r})`} />
        ))}
      </g>
      <circle r="1.9" fill={centre} />
    </svg>
  );
}

export interface BloomColors {
  flower: string;
  soft: string;
  leaf: string;
}

/** Brand blossom colours (garnet, blush, sage) for app chrome. */
export const BRAND_BLOOM: BloomColors = {
  flower: "var(--primary)",
  soft: "var(--color-brand-300)",
  leaf: "color-mix(in oklab, var(--accent) 35%, #4e6b3c)",
};

const SPRAY = [
  { x: 14, y: 14, r: 10, soft: false },
  { x: 32, y: 9, r: 7, soft: true },
  { x: 9, y: 33, r: 7.5, soft: true },
  { x: 30, y: 28, r: 6, soft: false },
  { x: 50, y: 7, r: 5.5, soft: false },
  { x: 7, y: 52, r: 5.5, soft: false },
  { x: 46, y: 20, r: 4.2, soft: true },
  { x: 20, y: 46, r: 4.2, soft: true },
  { x: 66, y: 12, r: 3.6, soft: true },
  { x: 12, y: 68, r: 3.6, soft: true },
  { x: 40, y: 38, r: 3.4, soft: false },
  { x: 78, y: 5, r: 2.8, soft: false },
  { x: 5, y: 80, r: 2.8, soft: false },
  { x: 22, y: 22, r: 3, soft: true },
];

/**
 * A spray of blossoms and leaves anchored in the top-left corner of its box.
 * Flip a wrapper (not the SVG) for other corners, so animations that set a
 * transform origin on the SVG keep working.
 */
export function CornerBloom({ colors = BRAND_BLOOM, className, ...props }: { colors?: BloomColors; className?: string } & React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 96 96" className={cn("block size-32", className)} aria-hidden {...props}>
      <g fill="none" stroke={colors.leaf} strokeWidth="1.4" strokeLinecap="round">
        <path d="M6 6 C 30 12, 52 6, 88 4" />
        <path d="M6 6 C 12 30, 6 52, 4 88" />
        <path d="M14 14 C 30 24, 40 34, 46 46" />
      </g>
      <g fill={colors.leaf}>
        <ellipse cx="66" cy="8" rx="6" ry="2.4" transform="rotate(-12 66 8)" />
        <ellipse cx="8" cy="68" rx="2.4" ry="6" transform="rotate(12 8 68)" />
        <ellipse cx="44" cy="4" rx="5" ry="2" transform="rotate(14 44 4)" />
        <ellipse cx="4" cy="44" rx="2" ry="5" transform="rotate(-14 4 44)" />
        <ellipse cx="58" cy="14" rx="4.5" ry="1.8" transform="rotate(24 58 14)" />
        <ellipse cx="14" cy="58" rx="1.8" ry="4.5" transform="rotate(-24 14 58)" />
        <ellipse cx="36" cy="44" rx="4" ry="1.7" transform="rotate(48 36 44)" />
      </g>
      {SPRAY.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.r / 6})`} fill={b.soft ? colors.soft : colors.flower}>
          {PETAL_ANGLES.map((a) => (
            <ellipse key={a} cx="0" cy="-3.4" rx="1.7" ry="3.2" transform={`rotate(${a})`} />
          ))}
          <circle r="1.3" fill="rgb(255 255 255 / 0.85)" />
        </g>
      ))}
    </svg>
  );
}

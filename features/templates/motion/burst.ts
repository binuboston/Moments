import { burst as brandBurst, type BurstShape } from "@/components/brand/burst";

export type ParticleKind = "petals" | "confetti" | "sparkles";

/** Particle colours per template kind: "petals" leans romantic pink; the others stay in the accent family. */
const PALETTES: Record<ParticleKind, string[]> = {
  petals: [
    "color-mix(in oklab, var(--inv-accent) 40%, #d81b60)",
    "color-mix(in oklab, var(--inv-accent) 30%, #f8bbd0)",
    "color-mix(in oklab, var(--inv-accent) 20%, #fff8ee)",
    "color-mix(in oklab, var(--inv-accent) 75%, #ffd27a)",
  ],
  sparkles: ["var(--inv-accent)", "color-mix(in oklab, var(--inv-accent) 55%, white)", "color-mix(in oklab, var(--inv-accent) 25%, #fff8ee)", "color-mix(in oklab, var(--inv-accent) 80%, #ffd27a)"],
  confetti: ["var(--inv-accent)", "var(--inv-c2)", "var(--inv-c3)", "color-mix(in oklab, var(--inv-accent) 55%, white)"],
};

const SHAPES: Record<ParticleKind, BurstShape> = { petals: "blossoms", sparkles: "blossoms-and-stars", confetti: "confetti" };

/** The opening-card burst, coloured from the invitation's theme. */
export function burst(layer: HTMLElement, kind: ParticleKind, x: number, y: number) {
  brandBurst(layer, x, y, { colors: PALETTES[kind], shape: SHAPES[kind] });
}

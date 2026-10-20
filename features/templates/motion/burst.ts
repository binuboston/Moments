import { gsap } from "@/lib/motion/gsap";

export type ParticleKind = "petals" | "confetti" | "sparkles";

/** Blossom colours per kind. "petals" leans romantic pink; the others stay in the accent family. */
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

const PETAL_ANGLES = [0, 60, 120, 180, 240, 300];

/** Six-petal blossom (the reference's flower glyph), drawn in currentColor. */
export function blossomSvg(centre = "rgb(255 255 255 / 0.85)"): string {
  const petals = PETAL_ANGLES.map((r) => `<ellipse cx="0" cy="-5.2" rx="2.3" ry="4.6" transform="rotate(${r})"/>`).join("");
  return `<svg viewBox="-11 -11 22 22" width="100%" height="100%" aria-hidden="true"><g fill="currentColor">${petals}</g><circle r="1.9" fill="${centre}"/></svg>`;
}

const STAR = `<svg viewBox="-10 -10 20 20" width="100%" height="100%" aria-hidden="true"><path fill="currentColor" d="M0-10C1 -3 3-1 10 0 3 1 1 3 0 10-1 3-3 1-10 0-3-1-1-3 0-10Z"/></svg>`;

function particle(kind: ParticleKind, color: string): HTMLElement {
  const r = gsap.utils.random;
  const el = document.createElement("span");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `position:absolute;left:0;top:0;will-change:transform,opacity;color:${color}`;
  if (kind === "confetti") {
    const w = r(6, 11);
    el.style.width = `${w}px`;
    el.style.height = `${r(0, 1) > 0.5 ? w : w * 0.45}px`;
    el.style.background = color;
    el.style.borderRadius = r(0, 1) > 0.66 ? "999px" : "2px";
  } else {
    const size = r(12, 24);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.innerHTML = kind === "sparkles" && r(0, 1) > 0.55 ? STAR : blossomSvg();
  }
  return el;
}

/**
 * One-shot celebratory burst from (x, y) in viewport pixels: blossoms pop out
 * in every direction, then tumble down past the bottom of the screen and
 * remove themselves. `layer` must be a fixed, pointer-events-none container.
 */
export function burst(layer: HTMLElement, kind: ParticleKind, x: number, y: number, count = 46) {
  const r = gsap.utils.random;
  const colors = PALETTES[kind];
  const vh = window.innerHeight;
  const reach = Math.min(window.innerWidth, 520) * 0.55;

  for (let i = 0; i < count; i++) {
    const el = particle(kind, colors[i % colors.length]);
    layer.appendChild(el);
    const angle = (i / count) * Math.PI * 2 + r(-0.3, 0.3);
    const dist = r(0.25, 1) * reach;
    const popX = x + Math.cos(angle) * dist;
    const popY = y + Math.sin(angle) * dist * 0.8;
    gsap
      .timeline({ onComplete: () => el.remove() })
      .set(el, { x, y, xPercent: -50, yPercent: -50, scale: 0, rotate: r(0, 360), opacity: 1 })
      .to(el, { x: popX, y: popY, scale: r(0.7, 1.15), rotate: `+=${r(-120, 120)}`, duration: r(0.45, 0.7), ease: "power3.out" })
      .to(el, {
        y: vh + 60,
        x: `+=${r(-90, 90)}`,
        rotate: `+=${r(-420, 420)}`,
        rotationY: r(-360, 360),
        duration: r(1.7, 2.8),
        ease: "power1.in",
      })
      .to(el, { opacity: 0, duration: 0.5 }, "-=0.5");
  }
}

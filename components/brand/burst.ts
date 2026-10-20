import { gsap } from "@/lib/motion/gsap";
import { blossomMarkup } from "@/components/brand/blossom";

export type BurstShape = "blossoms" | "blossoms-and-stars" | "confetti";

export interface BurstOptions {
  /** CSS colours; particles cycle through them. */
  colors: string[];
  shape?: BurstShape;
  count?: number;
  /** 1 = full-screen celebration; smaller values make a local flourish. */
  scale?: number;
}

const STAR = `<svg viewBox="-10 -10 20 20" width="100%" height="100%" aria-hidden="true"><path fill="currentColor" d="M0-10C1 -3 3-1 10 0 3 1 1 3 0 10-1 3-3 1-10 0-3-1-1-3 0-10Z"/></svg>`;

function particle(shape: BurstShape, color: string, scale: number): HTMLElement {
  const r = gsap.utils.random;
  const el = document.createElement("span");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = `position:absolute;left:0;top:0;will-change:transform,opacity;color:${color}`;
  if (shape === "confetti") {
    const w = r(6, 11) * Math.max(scale, 0.7);
    el.style.width = `${w}px`;
    el.style.height = `${r(0, 1) > 0.5 ? w : w * 0.45}px`;
    el.style.background = color;
    el.style.borderRadius = r(0, 1) > 0.66 ? "999px" : "2px";
  } else {
    const size = r(12, 24) * Math.max(scale, 0.65);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.innerHTML = shape === "blossoms-and-stars" && r(0, 1) > 0.55 ? STAR : blossomMarkup();
  }
  return el;
}

/**
 * Celebratory burst from (x, y) in viewport pixels: particles pop out in every
 * direction, then tumble down past the bottom of the screen and remove
 * themselves. `layer` must be a fixed, pointer-events-none container.
 * Callers are responsible for skipping it under reduced motion.
 */
export function burst(layer: HTMLElement, x: number, y: number, { colors, shape = "blossoms", count = 46, scale = 1 }: BurstOptions) {
  const r = gsap.utils.random;
  const vh = window.innerHeight;
  const reach = Math.min(window.innerWidth, 520) * 0.55 * scale;

  for (let i = 0; i < count; i++) {
    const el = particle(shape, colors[i % colors.length], scale);
    layer.appendChild(el);
    const angle = (i / count) * Math.PI * 2 + r(-0.3, 0.3);
    const dist = r(0.25, 1) * reach;
    gsap
      .timeline({ onComplete: () => el.remove() })
      .set(el, { x, y, xPercent: -50, yPercent: -50, scale: 0, rotate: r(0, 360), opacity: 1 })
      .to(el, { x: x + Math.cos(angle) * dist, y: y + Math.sin(angle) * dist * 0.8, scale: r(0.7, 1.15), rotate: `+=${r(-120, 120)}`, duration: r(0.45, 0.7), ease: "power3.out" })
      .to(el, { y: scale < 1 ? `+=${r(120, 260) * scale + 80}` : vh + 60, x: `+=${r(-90, 90) * scale}`, rotate: `+=${r(-420, 420)}`, rotationY: r(-360, 360), duration: r(1.4, 2.6), ease: "power1.in" })
      .to(el, { opacity: 0, duration: 0.5 }, "-=0.5");
  }
}

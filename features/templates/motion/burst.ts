import { gsap } from "@/lib/motion/gsap";

export type ParticleKind = "petals" | "confetti" | "sparkles";

// Petals and sparkles stay in the accent family (a palette's other swatches can be its text colour).
const ACCENTS = ["var(--inv-accent)", "color-mix(in oklab, var(--inv-accent) 60%, white)", "color-mix(in oklab, var(--inv-accent) 75%, var(--inv-bg))", "color-mix(in oklab, var(--inv-accent) 85%, #e0607e)"];
const PARTY = ["var(--inv-accent)", "var(--inv-c2)", "var(--inv-c3)", "color-mix(in oklab, var(--inv-accent) 55%, white)"];

function shape(kind: ParticleKind, el: HTMLElement) {
  const r = gsap.utils.random;
  const colors = kind === "confetti" ? PARTY : ACCENTS;
  const color = colors[r(0, colors.length - 1, 1)];
  el.style.background = color;
  if (kind === "petals") {
    const w = r(10, 16);
    el.style.width = `${w}px`;
    el.style.height = `${w * r(1.3, 1.7)}px`;
    el.style.borderRadius = "0 100% 0 100%";
    el.style.opacity = "0.9";
  } else if (kind === "confetti") {
    const w = r(6, 11);
    el.style.width = `${w}px`;
    el.style.height = `${r(0, 1) > 0.5 ? w : w * 0.45}px`;
    el.style.borderRadius = r(0, 1) > 0.66 ? "999px" : "2px";
  } else {
    const w = r(3, 7);
    el.style.width = `${w}px`;
    el.style.height = `${w}px`;
    el.style.borderRadius = "999px";
    el.style.boxShadow = `0 0 ${w * 2}px ${color}`;
  }
}

/**
 * One-shot celebratory burst from (x, y) in viewport pixels. Particles fly up
 * and out, then drift down past the bottom of the screen and remove
 * themselves. `layer` must be a fixed, pointer-events-none container.
 */
export function burst(layer: HTMLElement, kind: ParticleKind, x: number, y: number, count = 36) {
  const r = gsap.utils.random;
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.setAttribute("aria-hidden", "true");
    el.style.position = "absolute";
    el.style.left = "0";
    el.style.top = "0";
    el.style.willChange = "transform, opacity";
    shape(kind, el);
    layer.appendChild(el);

    const angle = r(-Math.PI * 0.95, -Math.PI * 0.05);
    const power = r(0.25, 0.6);
    const peakX = x + Math.cos(angle) * vw * power;
    const peakY = y + Math.sin(angle) * vh * power * 0.8;
    gsap
      .timeline({ onComplete: () => el.remove() })
      .set(el, { x, y, rotate: r(0, 360), scale: r(0.6, 1.1) })
      .to(el, { x: peakX, y: peakY, duration: r(0.5, 0.8), ease: "power3.out" })
      .to(el, { y: vh + 40, x: `+=${r(-80, 80)}`, rotate: `+=${r(-360, 360)}`, rotateX: r(-540, 540), duration: r(2, 3.2), ease: "power1.in" })
      .to(el, { opacity: 0, duration: 0.6 }, "-=0.6");
  }
}

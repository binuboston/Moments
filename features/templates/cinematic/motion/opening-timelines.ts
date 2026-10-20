import type { gsap as GsapType } from "gsap";
import type { ArtDirection } from "@/features/templates/cinematic/art-direction";

type Gsap = typeof GsapType;

/**
 * Builds the opening timeline for a cover style. Parts are located by
 * [data-cover-part] inside the cover element. Only transform and opacity are
 * animated. Total duration is ~1.6 s at speed 1.
 */
export function buildOpeningTimeline(gsap: Gsap, cover: HTMLElement, style: ArtDirection["opening"]["style"], speed: number, onBurst: () => void) {
  const q = (part: string) => cover.querySelectorAll<HTMLElement>(`[data-cover-part="${part}"]`);
  const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
  tl.timeScale(1 / speed);

  tl.to(q("prompt"), { autoAlpha: 0, y: 8, duration: 0.25, ease: "power2.out" }, 0);

  if (style === "envelope") {
    tl.to(q("seal"), { scale: 0.6, autoAlpha: 0, duration: 0.35, ease: "back.in(2)" }, 0.05)
      .to(q("flap"), { rotateX: 180, duration: 0.6, transformOrigin: "50% 0%" }, 0.3)
      .add(onBurst, 0.55)
      .to(q("card"), { yPercent: -42, duration: 0.65, ease: "power3.out" }, 0.7)
      .to(q("envelope"), { yPercent: 18, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 1.1)
      .to(q("card"), { scale: 1.12, autoAlpha: 0, duration: 0.45, ease: "power2.in" }, 1.25);
  } else if (style === "gatefold") {
    tl.to(q("seal"), { scale: 0.6, autoAlpha: 0, duration: 0.3, ease: "back.in(2)" }, 0.05)
      .add(onBurst, 0.35)
      .to(q("door-left"), { rotateY: -105, xPercent: -6, duration: 0.95, transformOrigin: "0% 50%" }, 0.3)
      .to(q("door-right"), { rotateY: 105, xPercent: 6, duration: 0.95, transformOrigin: "100% 50%" }, 0.3)
      .to(q("doors"), { autoAlpha: 0, duration: 0.35 }, 1.05);
  } else {
    const layers = q("layer");
    tl.to(q("seal"), { scale: 0.6, autoAlpha: 0, duration: 0.3, ease: "back.in(2)" }, 0.05)
      .to(layers, { rotate: (i: number) => [-7, 5, 0][i] ?? 0, xPercent: (i: number) => [-9, 8, 0][i] ?? 0, duration: 0.5, ease: "power2.out", stagger: 0.04 }, 0.2)
      .add(onBurst, 0.55)
      .to(layers, { yPercent: -120, autoAlpha: 0, duration: 0.7, ease: "power3.in", stagger: 0.09 }, 0.75);
  }

  tl.to(q("backdrop"), { autoAlpha: 0, duration: 0.45, ease: "power2.out" }, ">-0.25");
  return tl;
}

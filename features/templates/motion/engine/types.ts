import type { MotionPreset } from "@/features/templates/motion/engine/presets";

export interface MotionContext {
  root: HTMLElement;
  /** Elements under the root matching a selector. */
  all: (selector: string) => HTMLElement[];
  /** The template's motion character (timing, distance, easing). */
  preset: MotionPreset;
}

/**
 * One declarative motion behaviour. Effects are registered in
 * `engine/registry.ts` and run inside a gsap.matchMedia() context, so every
 * tween, ScrollTrigger and SplitText they create is reverted automatically.
 *
 * Elements opt in with attributes; an effect only ever touches its own.
 */
export interface MotionEffect {
  /** Shown in docs and dev warnings. */
  name: string;
  /**
   * Either a `data-inv-reveal` variant this effect owns (e.g. "split"), or a
   * selector for elements it owns. Exactly one should be set.
   */
  reveal?: string;
  selector?: string;
  /** Plays once the guest has opened the invitation. */
  run: (elements: HTMLElement[], ctx: MotionContext) => void;
}

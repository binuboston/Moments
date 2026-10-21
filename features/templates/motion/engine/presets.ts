import { DURATION, EASE, RISE, STAGGER } from "@/lib/motion/tokens";

/**
 * A template's motion character. Effects read timing and distance from here
 * instead of hard-coding them, so one template can feel calm and another
 * lively without any effect knowing which template it is in.
 */
export interface MotionPreset {
  /** Entrance duration (seconds). */
  duration: number;
  /** Upward travel for entrances (px). */
  rise: number;
  ease: string;
  /** Easing without overshoot, for masked text whose overshoot would be clipped. */
  settle: string;
  /** Delay between items revealed together (seconds). */
  stagger: number;
  /** How the hero title arrives: letter by letter, or word by word. */
  title: "chars" | "words";
  /** Multiplier for parallax depth and scroll-linked drift. */
  depth: number;
}

export const MOTION_PRESETS = {
  /** Soft, unhurried: long landings, small movements. Classic and pastel designs. */
  gentle: { duration: DURATION.reveal, rise: RISE, ease: EASE.out, settle: EASE.out, stagger: STAGGER.items, title: "chars", depth: 1 },
  /** Confident and cinematic: longer travel, deeper parallax, words over letters. */
  editorial: { duration: DURATION.reveal * 1.15, rise: RISE * 1.45, ease: "power4.out", settle: "power4.out", stagger: STAGGER.items * 1.3, title: "words", depth: 1.35 },
  /** Bouncy and quick, for parties and birthdays. */
  playful: { duration: DURATION.reveal * 0.85, rise: RISE * 1.25, ease: "back.out(1.5)", settle: EASE.out, stagger: STAGGER.items * 0.8, title: "chars", depth: 0.8 },
} as const satisfies Record<string, MotionPreset>;

export type MotionPresetKey = keyof typeof MOTION_PRESETS;

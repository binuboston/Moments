import type { ArtDirection } from "@/features/templates/cinematic/art-direction";

export interface MotionPreset {
  /** Base delay step between staggered hero elements (ms). */
  heroStep: number;
  /** Opening timeline overall speed multiplier (1 = ~1.6 s). */
  openingSpeed: number;
  /** Parallax travel in percent of element height. */
  parallax: number;
}

export const MOTION_PRESETS: Record<ArtDirection["motion"], MotionPreset> = {
  gentle: { heroStep: 140, openingSpeed: 1, parallax: 8 },
  editorial: { heroStep: 110, openingSpeed: 0.85, parallax: 12 },
};

import { depth } from "@/features/templates/motion/engine/effects/depth";
import { draw } from "@/features/templates/motion/engine/effects/draw";
import { drift } from "@/features/templates/motion/engine/effects/drift";
import { exit } from "@/features/templates/motion/engine/effects/exit";
import { hero } from "@/features/templates/motion/engine/effects/hero";
import { mask } from "@/features/templates/motion/engine/effects/mask";
import { rise } from "@/features/templates/motion/engine/effects/rise";
import { split } from "@/features/templates/motion/engine/effects/split";
import { stagger } from "@/features/templates/motion/engine/effects/stagger";
import { words } from "@/features/templates/motion/engine/effects/words";
import type { MotionEffect } from "@/features/templates/motion/engine/types";

/**
 * Every motion effect, run in this order. To add one: write it in effects/,
 * register it here, and document its attribute in docs/TEMPLATES.md.
 * `data-inv-reveal` values that no effect claims fall back to `rise`.
 */
export const MOTION_EFFECTS: readonly MotionEffect[] = [hero, rise, split, words, stagger, mask, draw, depth, drift, exit];

/** Elements whose hidden starting state the engine owns (CSS keeps them hidden until bound). */
export const OWNED_SELECTOR = "[data-inv-hero], [data-inv-reveal]";

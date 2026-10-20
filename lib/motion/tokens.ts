/**
 * Motion tokens. CSS mirrors these in app/globals.css (@theme) so CSS and GSAP
 * animations feel like one system. Change both together.
 */
export const DURATION = {
  fast: 0.16,
  base: 0.24,
  slow: 0.48,
  /** Entrances of large type and imagery. */
  reveal: 1.1,
} as const;

export const EASE = {
  /** Default for entrances: fast start, long soft landing. */
  out: "expo.out",
  /** UI state changes (panels, chips, lists). */
  ui: "power3.out",
  /** Symmetric moves (pinned sequences, crossfades). */
  inOut: "power2.inOut",
  /** Exits. */
  in: "power2.in",
} as const;

export const STAGGER = {
  lines: 0.08,
  items: 0.06,
} as const;

/** Distance (px) for upward entrances. */
export const RISE = 28;

export interface MotionCapabilities {
  /** User asked for less motion: no transitions beyond quick fades. */
  reduced: boolean;
  /** Low-power or data-saver device: keep reveals, drop parallax, particles and ambient float. */
  lite: boolean;
}

export const NO_MOTION: MotionCapabilities = { reduced: true, lite: true };

/** Browser-only. Call inside effects, never during render. */
export function detectCapabilities(): MotionCapabilities {
  if (typeof window === "undefined") return NO_MOTION;
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  const saveData = Boolean(nav.connection?.saveData);
  const lowCpu = typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2;
  return { reduced, lite: reduced || saveData || lowCpu || lowMemory };
}

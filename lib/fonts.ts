import { Pacifico } from "next/font/google";

/**
 * Pacifico for the "Invite" wordmark. Self-hosted by next/font (no request to
 * Google at runtime) and preloaded, because the logo is in every header.
 * Applied through its generated class, so it never depends on global CSS.
 */
export const wordmarkFont = Pacifico({ subsets: ["latin"], weight: "400", display: "swap" });

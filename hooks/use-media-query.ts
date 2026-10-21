"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether a media query matches, kept in sync as the viewport changes.
 * Renders as `serverValue` on the server and during hydration.
 */
export function useMediaQuery(query: string, serverValue = true): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Tailwind's `sm` breakpoint and up: tablets and desktops. */
export const WIDE_SCREEN = "(min-width: 640px)";

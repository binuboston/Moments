"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

let minute = 0;
function minuteSnapshot() {
  const current = Math.floor(Date.now() / 60_000) * 60_000;
  if (current !== minute) minute = current;
  return minute;
}

/**
 * The current time rounded down to the minute, or null during server rendering
 * and hydration. Stable between renders (unlike Date.now()), and does not tick:
 * use it for day-level labels such as "In 12 days".
 */
export function useClientNow(): number | null {
  return useSyncExternalStore(noop, minuteSnapshot, () => null);
}

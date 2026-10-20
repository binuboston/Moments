"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let snapshot = 0;

function start() {
  if (timer) return;
  snapshot = Date.now();
  timer = setInterval(() => {
    snapshot = Date.now();
    listeners.forEach((l) => l());
  }, 1000);
}

function stop() {
  if (timer && listeners.size === 0) {
    clearInterval(timer);
    timer = undefined;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => {
    listeners.delete(listener);
    stop();
  };
}

/**
 * Current time ticking once per second, shared across all subscribers.
 * Returns null during server rendering and the first client render so that
 * server and client markup match.
 */
export function useNow(): number | null {
  return useSyncExternalStore(
    subscribe,
    () => snapshot || Date.now(),
    () => null,
  );
}

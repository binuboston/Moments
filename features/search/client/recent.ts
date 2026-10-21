"use client";

import { useSyncExternalStore } from "react";

const KEY = "invite:recent-searches";
const MAX = 6;
const EVENT = "invite:recent-searches";
const EMPTY: string[] = [];

let cache: { raw: string | null; list: string[] } = { raw: null, list: EMPTY };

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== cache.raw) cache = { raw, list: raw ? (JSON.parse(raw) as string[]).filter((s) => typeof s === "string").slice(0, MAX) : EMPTY };
    return cache.list;
  } catch {
    return EMPTY;
  }
}

function write(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // Private mode or storage disabled: recents are a convenience only.
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Recent searches in this browser (most recent first). Per viewer only; never sent anywhere. */
export function useRecentSearches() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    list,
    add: (q: string) => {
      const term = q.trim();
      if (term) write([term, ...read().filter((t) => t.toLowerCase() !== term.toLowerCase())]);
    },
    remove: (q: string) => write(read().filter((t) => t !== q)),
  };
}

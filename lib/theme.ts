"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "@/lib/theme-key";

/**
 * Light / dark theme for the app chrome (invitations keep their own palettes).
 * The preference lives in this browser only; "system" follows the device.
 * The pre-paint script (lib/motion/pre-paint.ts) applies it before first
 * paint, so there is no flash of the wrong theme.
 */
export type ThemePreference = "system" | "light" | "dark";

const EVENT = "invite:theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
/** Browser UI colour (address bar) per resolved theme: the page background. */
const THEME_COLOR = { light: "#ffffff", dark: "#0f0f10" } as const;

function read(): ThemePreference {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(pref: ThemePreference): "light" | "dark" {
  if (pref !== "system") return pref;
  return typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/** Puts the resolved theme on <html> (class, color-scheme) and the browser's theme colour. */
export function applyTheme(pref: ThemePreference = read()) {
  const resolved = resolveTheme(pref);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR[resolved]);
}

export function setThemePreference(pref: ThemePreference) {
  try {
    if (pref === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    // Storage blocked: the choice still applies for this page view.
  }
  applyTheme(pref);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DARK_QUERY);
  // Following the system: re-apply when the device switches between light and dark.
  const onSystem = () => {
    if (read() === "system") applyTheme("system");
    onChange();
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onSystem);
  mq.addEventListener("change", onSystem);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onSystem);
    mq.removeEventListener("change", onSystem);
  };
}

/** The saved preference ("system" until the visitor chooses). */
export function useThemePreference(): ThemePreference {
  return useSyncExternalStore(subscribe, read, () => "system");
}

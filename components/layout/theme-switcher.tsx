"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { setThemePreference, useThemePreference, type ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils/cn";

export const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
  { value: "system", label: "System", icon: MonitorIcon },
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
];

/** Appearance: follow the device (default), or always light / dark. A segmented radio group. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const value = useThemePreference();
  return (
    <div role="radiogroup" aria-label="Appearance" className={cn("grid grid-cols-3 gap-1 rounded-full bg-fill p-1", className)} data-testid="theme-switcher">
      {THEME_OPTIONS.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setThemePreference(o.value)}
            data-testid={`theme-${o.value}`}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium transition-[background-color,color,box-shadow] duration-(--duration-base) outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "bg-surface text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <o.icon className="size-4" aria-hidden />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Keeps "System" in step with the device even when no switcher is on screen. Mounted once in Providers. */
export function ThemeSync() {
  useThemePreference();
  return null;
}

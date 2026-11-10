import * as Icons from "lucide-react";

const FALLBACK_ICON = Icons.Sparkles;

/** The Lucide icon an event category names in the database (`event_categories.icon`), or a sparkle. */
export function categoryIcon(name: string | null): Icons.LucideIcon {
  if (!name) return FALLBACK_ICON;
  const icon = (Icons as unknown as Record<string, Icons.LucideIcon | undefined>)[name];
  return typeof icon === "function" || (typeof icon === "object" && icon !== null) ? icon : FALLBACK_ICON;
}

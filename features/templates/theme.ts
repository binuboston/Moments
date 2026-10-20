import type { CSSProperties } from "react";
import { REQUIRED_SECTIONS, SECTION_KEYS, type SectionKey } from "@/types/domain";
import type { ThemeInput } from "@/lib/validation/theme";
import { fontFamily } from "@/features/templates/fonts";
import type { InvitationView, ResolvedTheme, TemplateDefinition } from "@/features/templates/types";

/** Whether the invitation has data for a section. Sections with nothing to show are hidden. */
export function sectionHasContent(section: SectionKey, view: InvitationView): boolean {
  const c = view.content;
  switch (section) {
    case "hero":
    case "details":
      return true;
    case "intro":
      return Boolean(c.intro || c.hosts || c.subheading);
    case "countdown":
      return new Date(c.startsAt).getTime() > Date.now();
    case "schedule":
      return view.functions.length > 0;
    case "gallery":
      return view.media.gallery.length > 0;
    case "rsvp":
      return view.settings.rsvp.enabled;
    case "contacts":
      return c.contacts.length > 0;
    case "gifts":
      return Boolean(c.gifts.note || c.gifts.url);
    case "message":
      return Boolean(c.message);
    default:
      return false;
  }
}

/**
 * Resolves palette, fonts and section visibility for a template + user theme.
 * Unknown ids fall back to template defaults so a removed palette never breaks rendering.
 */
export function resolveTheme(def: TemplateDefinition, theme: ThemeInput, view: InvitationView): ResolvedTheme {
  const palette = def.palettes.find((p) => p.id === theme.paletteId) ?? def.palettes.find((p) => p.id === def.defaults.paletteId) ?? def.palettes[0];
  const fonts =
    def.fontPairings.find((f) => f.id === theme.fontPairingId) ??
    def.fontPairings.find((f) => f.id === def.defaults.fontPairingId) ??
    def.fontPairings[0];

  const sections = {} as Record<SectionKey, boolean>;
  for (const key of SECTION_KEYS) {
    const supported = def.sections.includes(key);
    const required = REQUIRED_SECTIONS.includes(key);
    const userChoice = theme.sections[key];
    const enabled = required ? true : userChoice ?? def.defaultSections.includes(key);
    sections[key] = supported && enabled && sectionHasContent(key, view);
  }

  return { palette, fonts, sections };
}

/** CSS custom properties for the template root. */
export function themeCssVars(theme: ResolvedTheme): CSSProperties {
  const v = theme.palette.vars;
  return {
    "--inv-bg": v.bg,
    "--inv-surface": v.surface,
    "--inv-text": v.text,
    "--inv-muted": v.muted,
    "--inv-accent": v.accent,
    "--inv-accent-contrast": v.accentContrast,
    "--inv-border": v.border,
    "--inv-font-display": fontFamily(theme.fonts.display),
    "--inv-font-body": fontFamily(theme.fonts.body),
  } as CSSProperties;
}

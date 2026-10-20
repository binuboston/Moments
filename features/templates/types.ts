import type { ComponentType } from "react";
import type { CategorySlug, SectionKey, TemplateTier } from "@/types/domain";
import type { InvitationContent } from "@/lib/validation/content";
import type { InvitationFunction } from "@/lib/validation/functions";
import type { InvitationSettings } from "@/lib/validation/settings";
import type { ThemeInput } from "@/lib/validation/theme";
import type { FontKey } from "@/features/templates/fonts";

export interface Palette {
  id: string;
  name: string;
  /** CSS colour values applied as --inv-* variables on the template root. */
  vars: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    accentContrast: string;
    border: string;
  };
  /** Used for swatches in the editor and catalogue. */
  swatch: [string, string, string];
  /**
   * Optional extra roles for richer templates (e.g. contrastBg, rose, olive).
   * Emitted as --inv-<kebab-case-key> custom properties.
   */
  extra?: Record<string, string>;
}

export interface FontPairing {
  id: string;
  name: string;
  display: FontKey;
  body: FontKey;
  /** Romantic accent face (ampersands, signatures). Falls back to display. */
  script?: FontKey;
}

export interface MediaItem {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  alt: string;
}

/** Everything a template needs to render, already validated and resolved. */
export interface InvitationView {
  id: string;
  slug: string;
  status: "draft" | "published" | "unpublished";
  category: CategorySlug;
  content: InvitationContent;
  functions: InvitationFunction[];
  media: { cover: MediaItem | null; gallery: MediaItem[] };
  settings: InvitationSettings;
  theme: ThemeInput;
  template: { key: string; name: string; tier: TemplateTier };
  publicUrl: string;
  showBranding: boolean;
}

export interface ResolvedTheme {
  palette: Palette;
  fonts: FontPairing;
  /** Final visibility after applying template defaults, user overrides and content availability. */
  sections: Record<SectionKey, boolean>;
}

/**
 * "public": the real guest page (full page, saves RSVPs).
 * "demo": full-page sample (catalogue live demo); behaves like public but never submits data.
 * "preview": rendered inside a scaled frame (editor, catalogue).
 */
export type RenderMode = "public" | "demo" | "preview";

/** Full-viewport layout (fixed cover, page scroll lock, parallax). */
export const isFullPage = (mode: RenderMode) => mode !== "preview";
/** Side effects that persist data, e.g. RSVP submission. */
export const canSubmit = (mode: RenderMode) => mode === "public";

/**
 * "full": opening cover, entrance and scroll motion (public page, editor preview, live demo).
 * "static": everything visible immediately, no cover (catalogue cards, marketing mockups).
 */
export type MotionMode = "full" | "static";

export interface TemplateProps {
  view: InvitationView;
  theme: ResolvedTheme;
  mode: RenderMode;
  motion: MotionMode;
}

export interface TemplateDefinition {
  key: string;
  name: string;
  description: string;
  categories: CategorySlug[];
  tier: TemplateTier;
  sections: SectionKey[];
  defaultSections: SectionKey[];
  palettes: Palette[];
  fontPairings: FontPairing[];
  defaults: { paletteId: string; fontPairingId: string };
  /** "cinematic" templates are built from art-direction configs; see features/templates/cinematic. */
  experience?: "classic" | "cinematic";
  /** Small CSS gradient used for cards before the live preview mounts. */
  previewGradient: string;
  component: ComponentType<TemplateProps>;
}

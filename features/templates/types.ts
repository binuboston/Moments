import type { ComponentType } from "react";
import type { CategorySlug, SectionKey, TemplateTier } from "@/types/domain";
import type { InvitationContent } from "@/lib/validation/content";
import type { InvitationFunction } from "@/lib/validation/functions";
import type { InvitationSettings } from "@/lib/validation/settings";
import type { GalleryLayout, ThemeInput } from "@/lib/validation/theme";
import type { FontKey } from "@/features/templates/fonts";
import type { MotionPresetKey } from "@/features/templates/motion/engine/presets";

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
}

export interface FontPairing {
  id: string;
  name: string;
  display: FontKey;
  body: FontKey;
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
  gallery: GalleryLayout;
}

/**
 * "public": the real guest page (full page, saves RSVPs).
 * "demo": full-page sample (catalogue live demo); behaves like public but never submits data.
 * "preview": rendered inside a scaled frame (editor, catalogue).
 */
export type RenderMode = "public" | "demo" | "preview";

/** Side effects that persist data, e.g. RSVP submission. */
export const canSubmit = (mode: RenderMode) => mode === "public";

/**
 * How a template's card image is set (features/invitations/card-image.tsx).
 * The fonts are the invitation's own display and body fonts; this decides the
 * composition around them. Defaults: centred, weight 500, a hairline frame.
 */
export interface CardStyle {
  align?: "center" | "left";
  titleWeight?: 400 | 500 | 600 | 700 | 900;
  titleItalic?: boolean;
  titleUppercase?: boolean;
  /** Title letter spacing, in em (negative tightens). */
  titleTracking?: number;
  /** The occasion line above the title: spaced capitals, or a filled pill. */
  eyebrow?: "spaced" | "pill";
  /** "inset": hairline inner border. "double": two rules (deco). "none": full bleed. */
  frame?: "inset" | "double" | "none";
}

export interface TemplateProps {
  view: InvitationView;
  theme: ResolvedTheme;
  mode: RenderMode;
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
  /** `gallery` defaults to "carousel". */
  defaults: { paletteId: string; fontPairingId: string; gallery?: GalleryLayout };
  /** Small CSS gradient used for cards before the live preview mounts. */
  previewGradient: string;
  /** Celebration burst when the guest opens the invitation. Defaults to petals. */
  particles?: "petals" | "confetti" | "sparkles";
  /** Motion character on the guest page (see features/templates/motion/engine/presets.ts). Defaults to "gentle". */
  motion?: MotionPresetKey;
  /** Typography of the card image (dashboard thumbnails and link previews), echoing the hero. */
  card?: CardStyle;
  component: ComponentType<TemplateProps>;
}

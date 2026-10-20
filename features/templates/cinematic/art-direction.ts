import { z } from "zod";
import { CATEGORY_SLUGS, SECTION_KEYS } from "@/types/domain";
import { FONT_FAMILIES, type FontKey } from "@/features/templates/fonts";

/**
 * An ArtDirection is the whole creative definition of a cinematic template.
 * Sections, motion and accessibility are shared engine code; a new template is
 * a validated config (plus, occasionally, a new SVG ornament or layout variant).
 */

export const OPENING_STYLES = ["envelope", "gatefold", "layered-card"] as const;
export const PARTICLE_STYLES = ["petals", "gold-dust", "none"] as const;
export const HERO_LAYOUTS = ["arch", "framed", "editorial"] as const;
export const SAVE_THE_DATE_LAYOUTS = ["calendar", "monumental"] as const;
export const GALLERY_LAYOUTS = ["mosaic", "filmstrip", "columns"] as const;
export const CLOSING_LAYOUTS = ["botanical", "photo"] as const;
export const ORNAMENT_SETS = ["marigold", "night-botanical", "garden"] as const;
export const MOTION_PRESETS = ["gentle", "editorial"] as const;

/** Content blocks the engine can render, in any configured order. */
export const CINEMATIC_BLOCKS = ["hero", "introduction", "saveTheDate", "countdown", "venue", "schedule", "gallery", "rsvp", "gifts", "contacts", "closing"] as const;
export type CinematicBlock = (typeof CINEMATIC_BLOCKS)[number];

/** Which editor section toggle governs each block. null = always shown. */
export const BLOCK_SECTION: Record<CinematicBlock, (typeof SECTION_KEYS)[number] | null> = {
  hero: null,
  introduction: "intro",
  saveTheDate: "details",
  countdown: "countdown",
  venue: "details",
  schedule: "schedule",
  gallery: "gallery",
  rsvp: "rsvp",
  gifts: "gifts",
  contacts: "contacts",
  closing: null,
};

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use #RRGGBB");
const fontKey = z.custom<FontKey>((v) => typeof v === "string" && v in FONT_FAMILIES, "Unknown font key");

export const cinematicPaletteSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  /** Paper / page background. */
  bg: color,
  /** Raised paper (cards, envelope interior). */
  surface: color,
  text: color,
  muted: color,
  /** Gold linework, fills and large flourishes (decorative; may be low contrast). */
  accent: color,
  /** Gold for text on the paper background. Must meet WCAG AA (4.5:1) on bg. */
  accentInk: color,
  accentContrast: color,
  border: color,
  /** Contrast band (e.g. olive or charcoal) used for one or two sections. */
  contrastBg: color,
  contrastText: color,
  contrastMuted: color,
  /** Gold for text on the contrast band. Must meet WCAG AA on contrastBg. */
  contrastAccentInk: color,
  /** Secondary floral tones used by ornaments. */
  bloom: color,
  leaf: color,
});
export type CinematicPalette = z.infer<typeof cinematicPaletteSchema>;

export const artDirectionSchema = z
  .object({
    key: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    name: z.string().min(1),
    description: z.string().min(1).max(400),
    tier: z.enum(["free", "premium"]),
    categories: z.array(z.enum(CATEGORY_SLUGS)).min(1),
    palettes: z.array(cinematicPaletteSchema).min(1),
    fonts: z
      .array(z.object({ id: z.string().regex(/^[a-z0-9-]+$/), name: z.string().min(1), display: fontKey, body: fontKey, script: fontKey }))
      .min(1),
    defaults: z.object({ paletteId: z.string(), fontPairingId: z.string() }),
    opening: z.object({ style: z.enum(OPENING_STYLES), particles: z.enum(PARTICLE_STYLES), prompt: z.string().min(1).max(40) }),
    layouts: z.object({
      hero: z.enum(HERO_LAYOUTS),
      saveTheDate: z.enum(SAVE_THE_DATE_LAYOUTS),
      gallery: z.enum(GALLERY_LAYOUTS),
      closing: z.enum(CLOSING_LAYOUTS),
    }),
    ornaments: z.enum(ORNAMENT_SETS),
    motion: z.enum(MOTION_PRESETS),
    /** Order of content blocks. Opening cover is always first when enabled. */
    blocks: z.array(z.enum(CINEMATIC_BLOCKS)).min(3),
    /** Blocks rendered on the contrast band (e.g. olive) rather than paper. */
    contrastBlocks: z.array(z.enum(CINEMATIC_BLOCKS)).default([]),
    /** Editor section toggles that start disabled. */
    defaultHidden: z.array(z.enum(SECTION_KEYS)).default([]),
    previewGradient: z.string().min(1),
  })
  .superRefine((art, ctx) => {
    if (!art.palettes.some((p) => p.id === art.defaults.paletteId)) ctx.addIssue({ code: "custom", message: "default palette missing", path: ["defaults", "paletteId"] });
    if (!art.fonts.some((f) => f.id === art.defaults.fontPairingId)) ctx.addIssue({ code: "custom", message: "default font pairing missing", path: ["defaults", "fontPairingId"] });
    if (!art.blocks.includes("hero")) ctx.addIssue({ code: "custom", message: "hero block is required", path: ["blocks"] });
    if (new Set(art.blocks).size !== art.blocks.length) ctx.addIssue({ code: "custom", message: "duplicate block", path: ["blocks"] });
    for (const b of art.contrastBlocks) if (!art.blocks.includes(b)) ctx.addIssue({ code: "custom", message: `contrast block ${b} not in blocks`, path: ["contrastBlocks"] });
  });

export type ArtDirection = z.infer<typeof artDirectionSchema>;
export type ArtDirectionInput = z.input<typeof artDirectionSchema>;

import { z } from "zod";
import { SECTION_KEYS } from "@/types/domain";

export const GALLERY_LAYOUTS = ["carousel", "grid"] as const;
export type GalleryLayout = (typeof GALLERY_LAYOUTS)[number];

export const themeSchema = z.object({
  paletteId: z.string().trim().max(40).default(""),
  fontPairingId: z.string().trim().max(40).default(""),
  /** Visibility overrides for optional sections. Missing keys use template defaults. */
  sections: z.partialRecord(z.enum(SECTION_KEYS), z.boolean()).default({}),
  /** Gallery presentation; "" uses the template's default. Lenient so a bad value never invalidates the theme. */
  gallery: z.enum(GALLERY_LAYOUTS).or(z.literal("")).catch(""),
});

export type ThemeInput = z.infer<typeof themeSchema>;

export const defaultTheme: ThemeInput = { paletteId: "", fontPairingId: "", sections: {}, gallery: "" };

import { z } from "zod";
import { SECTION_KEYS } from "@/types/domain";

export const themeSchema = z.object({
  paletteId: z.string().trim().max(40).default(""),
  fontPairingId: z.string().trim().max(40).default(""),
  /** Visibility overrides for optional sections. Missing keys use template defaults. */
  sections: z.partialRecord(z.enum(SECTION_KEYS), z.boolean()).default({}),
});

export type ThemeInput = z.infer<typeof themeSchema>;

export const defaultTheme: ThemeInput = { paletteId: "", fontPairingId: "", sections: {} };

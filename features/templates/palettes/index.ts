import { DAISY_PALETTES } from "@/features/templates/palettes/daisy.generated";
import type { Palette } from "@/features/templates/types";

export type DaisyTheme = keyof typeof DAISY_PALETTES;

/**
 * Palettes converted from daisyUI themes (regenerate with
 * scripts/generate-daisy-palettes.mjs). Every one passes WCAG AA for body
 * text, muted text, accent text and button text. Ids are `daisy-<theme>`.
 */
export function daisy(...themes: DaisyTheme[]): Palette[] {
  return themes.map((t) => DAISY_PALETTES[t]);
}

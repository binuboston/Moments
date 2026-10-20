import {
  Cormorant_Garamond,
  Great_Vibes,
  Josefin_Sans,
  Lora,
  Manrope,
  Montserrat,
  Playfair_Display,
  Poppins,
} from "next/font/google";

/**
 * Template fonts. Loaded with preload disabled so a route only downloads the
 * families it actually renders. The root layout fonts (DM Sans, Fraunces) are
 * available to templates through --font-sans and --font-display.
 */
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], display: "swap", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], display: "swap", preload: false });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap", preload: false });
const lora = Lora({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], display: "swap", preload: false });
const josefin = Josefin_Sans({ subsets: ["latin"], weight: ["300", "400", "600"], display: "swap", preload: false });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", preload: false });

export const FONT_FAMILIES = {
  cormorant: { label: "Cormorant Garamond", family: cormorant.style.fontFamily },
  playfair: { label: "Playfair Display", family: playfair.style.fontFamily },
  "great-vibes": { label: "Great Vibes", family: greatVibes.style.fontFamily },
  manrope: { label: "Manrope", family: manrope.style.fontFamily },
  montserrat: { label: "Montserrat", family: montserrat.style.fontFamily },
  lora: { label: "Lora", family: lora.style.fontFamily },
  josefin: { label: "Josefin Sans", family: josefin.style.fontFamily },
  poppins: { label: "Poppins", family: poppins.style.fontFamily },
  fraunces: { label: "Fraunces", family: "var(--font-display)" },
  "dm-sans": { label: "DM Sans", family: "var(--font-sans)" },
} as const;

export type FontKey = keyof typeof FONT_FAMILIES;

export function fontFamily(key: FontKey): string {
  return FONT_FAMILIES[key].family;
}

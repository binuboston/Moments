/** Stand-in for next/font/google outside the Next.js compiler (Vitest). */
type FontResult = { className: string; variable: string; style: { fontFamily: string } };
const make = (name: string) => (): FontResult => ({ className: `font-${name}`, variable: `--font-${name}`, style: { fontFamily: `"${name.replace(/_/g, " ")}", serif` } });

export const Cormorant_Garamond = make("Cormorant_Garamond");
export const Great_Vibes = make("Great_Vibes");
export const Josefin_Sans = make("Josefin_Sans");
export const Lora = make("Lora");
export const Manrope = make("Manrope");
export const Montserrat = make("Montserrat");
export const Playfair_Display = make("Playfair_Display");
export const Poppins = make("Poppins");
export const DM_Sans = make("DM_Sans");
export const Fraunces = make("Fraunces");
export const Geist = make("Geist");
export const Geist_Mono = make("Geist_Mono");
export const Pinyon_Script = make("Pinyon_Script");
export const Noto_Serif_Devanagari = make("Noto_Serif_Devanagari");
export const Noto_Serif_Malayalam = make("Noto_Serif_Malayalam");

import "server-only";
import type { FontKey } from "@/features/templates/fonts";

/** Google Fonts family for each template font (the same families next/font serves on the page). */
const GOOGLE_FAMILY: Record<FontKey, string> = {
  cormorant: "Cormorant Garamond",
  playfair: "Playfair Display",
  "great-vibes": "Great Vibes",
  manrope: "Manrope",
  montserrat: "Montserrat",
  lora: "Lora",
  josefin: "Josefin Sans",
  poppins: "Poppins",
  fraunces: "Fraunces",
  "dm-sans": "DM Sans",
  marcellus: "Marcellus",
  fredoka: "Fredoka",
  archivo: "Archivo",
};

export interface CardFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700 | 900;
  style: "normal" | "italic";
}

/** Fonts per (family, weight, style, characters). Card text is short, so entries are small. */
const cache = new Map<string, Promise<ArrayBuffer | null>>();
const MAX_CACHE = 300;
const TIMEOUT_MS = 3000;

async function download(family: string, weight: number, italic: boolean, text: string): Promise<ArrayBuffer | null> {
  const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${axis}&text=${encodeURIComponent(text)}`;
  // A non-browser user agent gets TrueType, which the image renderer reads (it cannot read WOFF2).
  const css = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; InviteCards/1.0)" }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!css.ok) return null;
  const src = (await css.text()).match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
  if (!src) return null;
  const file = await fetch(src, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  return file.ok ? file.arrayBuffer() : null;
}

/**
 * One template font for the card image, subset to the characters drawn.
 * Falls back to weight 400 (and upright) when a family lacks the requested
 * cut, and to null on any network failure: the image then uses the default
 * font rather than failing.
 */
export async function loadCardFont(key: FontKey, weight: CardFont["weight"], italic: boolean, text: string): Promise<CardFont | null> {
  const family = GOOGLE_FAMILY[key];
  const chars = [...new Set(text)].sort().join("");
  const attempts: [number, boolean][] = [
    [weight, italic],
    [400, italic],
    [400, false],
  ];
  for (const [w, it] of attempts) {
    const id = `${family}|${w}|${it}|${chars}`;
    if (!cache.has(id)) {
      if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value!);
      cache.set(
        id,
        download(family, w, it, chars).catch(() => null),
      );
    }
    const data = await cache.get(id)!;
    // Register under the requested weight and style so the layout's styles match, whichever cut was found.
    if (data) return { name: family, data, weight, style: italic ? "italic" : "normal" };
  }
  return null;
}

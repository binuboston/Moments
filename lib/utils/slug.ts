import { z } from "zod";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MIN = 3;
export const SLUG_MAX = 60;

/** Words that would collide with routes or mislead guests. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "dashboard",
  "e",
  "edit",
  "help",
  "login",
  "logout",
  "new",
  "pricing",
  "privacy",
  "settings",
  "signup",
  "support",
  "templates",
  "terms",
  "www",
  "mirth",
  "official",
]);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(SLUG_MIN, `Use at least ${SLUG_MIN} characters`)
  .max(SLUG_MAX, `Use at most ${SLUG_MAX} characters`)
  .regex(SLUG_PATTERN, "Only lowercase letters, numbers and single hyphens")
  .refine((s) => !RESERVED_SLUGS.has(s), "This address is reserved");

/** Turns arbitrary text into a URL-safe slug fragment (may be empty). */
export function slugify(input: string, maxLength = 40): string {
  const normalised = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/&/g, " and ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  if (normalised.length <= maxLength) return normalised;
  const cut = normalised.slice(0, maxLength);
  return cut.replace(/-+$/g, "");
}

const SUFFIX_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no ambiguous characters

export function randomSuffix(length = 4, random: () => number = Math.random): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SUFFIX_ALPHABET[Math.floor(random() * SUFFIX_ALPHABET.length)];
  }
  return out;
}

/**
 * Builds a candidate slug from a headline. Always appends a short random suffix
 * so two "Aisha & Rohan" weddings never collide and the URL is hard to guess.
 */
export function generateSlug(headline: string, fallback = "invitation", random?: () => number): string {
  const base = slugify(headline, SLUG_MAX - 5) || fallback;
  const candidate = `${base}-${randomSuffix(4, random)}`;
  return candidate.slice(0, SLUG_MAX);
}

export function isValidSlug(slug: string): boolean {
  return slugSchema.safeParse(slug).success;
}

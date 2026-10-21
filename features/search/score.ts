/**
 * Matching and ranking shared by every in-memory provider (and used to rank
 * database rows), so results feel consistent across groups. Isomorphic.
 */
export interface Query {
  raw: string;
  /** Normalised: lower case, accents removed, single spaces. */
  text: string;
  tokens: string[];
}

export const MIN_QUERY = 1;
export const MAX_QUERY = 80;

export function normalize(value: string): string {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function parseQuery(raw: string): Query {
  const text = normalize(raw.slice(0, MAX_QUERY));
  return { raw, text, tokens: text.split(" ").filter(Boolean) };
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 0 (no match) to 100 (exact). */
export function fieldScore(query: Query, value: string | null | undefined): number {
  if (!value || !query.text) return 0;
  const text = normalize(value);
  if (text === query.text) return 100;
  if (text.startsWith(query.text)) return 85;
  if (new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(query.text)}`, "u").test(text)) return 70;
  if (text.includes(query.text)) return 50;
  if (query.tokens.length > 1 && query.tokens.every((t) => text.includes(t))) return 35;
  return 0;
}

/** Best weighted score across fields; 0 means the item does not match. */
export function scoreFields(query: Query, fields: { value: string | null | undefined; weight: number }[]): number {
  let best = 0;
  for (const f of fields) best = Math.max(best, fieldScore(query, f.value) * f.weight);
  return Math.round(best);
}

/** Splits text into plain and matched parts for highlighting (first match only). */
export function highlightParts(text: string, raw: string): { text: string; match: boolean }[] {
  const needle = raw.trim().toLowerCase();
  const at = needle ? text.toLowerCase().indexOf(needle) : -1;
  if (at < 0) return [{ text, match: false }];
  return [
    { text: text.slice(0, at), match: false },
    { text: text.slice(at, at + needle.length), match: true },
    { text: text.slice(at + needle.length), match: false },
  ].filter((p) => p.text);
}

import { ROUTES } from "@/lib/routes";

/**
 * A placeholder origin for parsing. Only paths are ever returned, so the
 * value is never visible; it lets the URL parser tell us whether a value
 * would leave the site.
 */
const BASE = "https://invite.invalid";

/** ASCII control characters (incl. tab, newline, carriage return) and DEL. Browsers silently drop tabs and newlines inside URLs, so "/\t/evil.com" would become "//evil.com". */
const CONTROL = /[\u0000-\u001F\u007F]/;

const MAX_LENGTH = 2048;

/**
 * Paths that must never be a post-auth destination: auth endpoints (loops,
 * replayed codes), the guest bootstrap page (loops) and API routes (not pages).
 */
const BLOCKED_PREFIXES: readonly string[] = [ROUTES.authCallback, ROUTES.authConfirm, ROUTES.signOut, ROUTES.login, ROUTES.signup, ROUTES.start, "/api"];

const isUnder = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

/**
 * The only way to turn an untrusted "where to go next" value (query string,
 * email link) into a redirect target. Returns a same-origin path (with its
 * query and hash), or `fallback`.
 *
 * Rejected: anything that is not a plain absolute path ("/..."), protocol-
 * relative forms ("//host", "/\\host"), control characters (literal or
 * already-decoded tabs and newlines), backslashes, absolute URLs, values that
 * resolve to another origin or to "//" after normalisation ("/.//host"),
 * auth and API endpoints, and over-long values.
 *
 * The parsed and normalised path is returned (not the raw input), so callers
 * navigate to exactly what was checked.
 */
export function safeNextPath(value: string | null | undefined, fallback: string = ROUTES.app): string {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_LENGTH) return fallback;
  if (CONTROL.test(value) || value.includes("\\")) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  let url: URL;
  try {
    url = new URL(value, BASE);
  } catch {
    return fallback;
  }
  if (url.origin !== BASE) return fallback;
  // Dot segments can collapse to a protocol-relative path ("/.//evil.com" -> "//evil.com").
  if (url.pathname.startsWith("//")) return fallback;
  if (BLOCKED_PREFIXES.some((p) => isUnder(url.pathname, p))) return fallback;

  return `${url.pathname}${url.search}${url.hash}`;
}

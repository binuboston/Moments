import { ROUTES } from "@/lib/routes";
/** Only allow same-origin relative paths for post-auth redirects. */
export function safeNextPath(value: string | null | undefined, fallback: string = ROUTES.app): string {
  if (!value) return fallback;
  if (!value.startsWith(ROUTES.home) || value.startsWith("//") || value.includes("\\")) return fallback;
  if (value.startsWith(ROUTES.authCallback) || value.startsWith(ROUTES.signOut) || value.startsWith(ROUTES.login) || value.startsWith(ROUTES.signup)) return fallback;
  return value;
}

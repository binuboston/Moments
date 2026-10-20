/** Only allow same-origin relative paths for post-auth redirects. */
export function safeNextPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  if (value.startsWith("/auth") || value.startsWith("/login") || value.startsWith("/signup")) return fallback;
  return value;
}

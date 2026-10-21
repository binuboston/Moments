import "server-only";
import { SEARCH_PROVIDERS } from "@/features/search/registry";
import type { SearchContext } from "@/features/search/provider";
import { MIN_QUERY, parseQuery } from "@/features/search/score";
import type { SearchGroup, SearchResponse } from "@/features/search/types";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

/** A provider slower than this is skipped for the request rather than holding up the rest. */
const PROVIDER_TIMEOUT_MS = 2500;

function withTimeout<T>(promise: Promise<T>, ms: number, name: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  return Promise.race([promise, new Promise<never>((_, reject) => (timer = setTimeout(() => reject(new Error(`${name} timed out`)), ms)))]).finally(() => clearTimeout(timer));
}

/**
 * Runs every provider that applies to the current visitor in parallel. A
 * provider that fails or times out is logged and left out; the others still
 * answer. Never creates a session (signed-out visitors get public results).
 */
export async function runSearch(raw: string, options: { limit?: number; groups?: readonly SearchGroup[] } = {}): Promise<SearchResponse> {
  const query = parseQuery(raw);
  if (query.text.length < MIN_QUERY) return { query: query.raw, groups: [] };
  const limit = options.limit ?? 5;

  const user = await getCurrentUser();
  const ctx: SearchContext = {
    user: user ? { id: user.id, isGuest: Boolean(user.is_anonymous) } : null,
    supabase: user ? await createClient() : null,
  };
  const providers = SEARCH_PROVIDERS.filter((p) => (!options.groups || options.groups.includes(p.group)) && (!p.requiresSession || ctx.user));

  const settled = await Promise.all(
    providers.map((p) =>
      withTimeout(p.search(query, ctx), PROVIDER_TIMEOUT_MS, p.group).catch((err: unknown) => {
        console.error(`[search] ${p.group} failed:`, err instanceof Error ? err.message : err);
        return [];
      }),
    ),
  );

  const groups = providers
    .map((p, i) => {
      const sorted = [...settled[i]].sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
      return { group: p.group, label: p.label, results: sorted.slice(0, limit), total: sorted.length };
    })
    .filter((g) => g.results.length > 0);

  return { query: query.raw, groups };
}

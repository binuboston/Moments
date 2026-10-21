import type { SupabaseClient } from "@supabase/supabase-js";
import type { Query } from "@/features/search/score";
import type { SearchGroup, SearchResult } from "@/features/search/types";
import type { Database } from "@/types/database";

export interface SearchContext {
  /** null for signed-out visitors (search never creates a session). */
  user: { id: string; isGuest: boolean } | null;
  /** Session-bound client: row-level security limits rows to the user's own. */
  supabase: SupabaseClient<Database> | null;
}

/**
 * One kind of result. Providers run in parallel on the server; each returns
 * its matches with a relevance score, and the runner sorts and trims them.
 * To add one: write it in providers/, then register it in registry.ts.
 */
export interface SearchProvider {
  group: SearchGroup;
  label: string;
  /** Only runs for people with a session (account or guest). */
  requiresSession?: boolean;
  search: (query: Query, ctx: SearchContext) => Promise<SearchResult[]>;
}

/** Text for a database ILIKE pattern: lower case, wildcards removed. */
export function likeToken(token: string): string {
  return token.toLowerCase().replace(/[%_\\]/g, "");
}

/** Query words for database matching (each must appear; any order). */
export function dbTokens(query: Query): string[] {
  return query.raw.trim().toLowerCase().split(/\s+/).map(likeToken).filter(Boolean).slice(0, 5);
}

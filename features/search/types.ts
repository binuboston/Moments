/**
 * Global search: one header search for the whole product. Results come from
 * providers (features/search/providers), each owning one group.
 */
export const SEARCH_GROUPS = ["invitations", "guests", "templates", "occasions", "actions", "help", "pages"] as const;
export type SearchGroup = (typeof SEARCH_GROUPS)[number];

/** Icon keys the client maps to icons (`category:<slug>` uses the occasion's icon and tone). */
export type SearchIconKey = "plus" | "mail" | "user" | "layout" | "help" | "page" | "settings" | "login" | `category:${string}`;

export interface SearchResult {
  /** Unique across all groups. */
  id: string;
  group: SearchGroup;
  title: string;
  subtitle?: string;
  href: string;
  icon: SearchIconKey;
  /** Relevance, higher is better (see score.ts). */
  score: number;
}

export interface SearchGroupResult {
  group: SearchGroup;
  label: string;
  results: SearchResult[];
  /** Matches before the limit was applied. */
  total: number;
}

export interface SearchResponse {
  query: string;
  groups: SearchGroupResult[];
}

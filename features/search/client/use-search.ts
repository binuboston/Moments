"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { MIN_QUERY } from "@/features/search/score";
import type { SearchResponse } from "@/features/search/types";

/** Waits until typing pauses before searching. */
const DEBOUNCE_MS = 150;

function useDebounced(value: string, ms: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/**
 * Header search results. Debounced, cancelled when the query changes (the
 * fetch is aborted), cached briefly per query, and the previous results stay
 * on screen while the next ones load (no flicker between keystrokes).
 */
export function useSearch(raw: string) {
  const q = useDebounced(raw.trim(), DEBOUNCE_MS);
  const query = useQuery({
    queryKey: ["search", q],
    queryFn: ({ signal }) => apiFetch<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`, { signal }),
    enabled: q.length >= MIN_QUERY,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
  const settled = q === raw.trim();
  return { ...query, data: q.length >= MIN_QUERY ? query.data : undefined, pending: !settled || query.isFetching };
}

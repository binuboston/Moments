import "server-only";

import { QueryClient } from "@tanstack/react-query";
import { cache } from "react";

/** One QueryClient per request for server-side prefetching + hydration. */
export const getServerQueryClient = cache(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }));

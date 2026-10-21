import { z } from "zod";
import { handle, json } from "@/lib/api/respond";
import { MAX_QUERY } from "@/features/search/score";
import { runSearch } from "@/features/search/server";

const querySchema = z.object({
  q: z.string().trim().max(MAX_QUERY).default(""),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

/** Global search for the header (and the /search page). Results depend on who is asking, so never cached. */
export const GET = handle(async (request: Request) => {
  const params = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
  const result = await runSearch(params.q, { limit: params.limit });
  return json(result, { headers: { "Cache-Control": "private, no-store" } });
});

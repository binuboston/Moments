import { handle, json, mapDbError, requireUser } from "@/lib/api/respond";
import { slugSchema } from "@/lib/utils/slug";

export const GET = handle(async (request: Request) => {
  const { supabase } = await requireUser();
  const url = new URL(request.url);
  const parsed = slugSchema.safeParse(url.searchParams.get("slug") ?? "");
  if (!parsed.success) return json({ available: false, reason: parsed.error.issues[0]?.message ?? "Invalid address" });
  const exclude = url.searchParams.get("exclude");
  // SECURITY DEFINER function: reveals only existence, which the public URL already reveals.
  const { data, error } = await supabase.rpc("slug_available", { p_slug: parsed.data, p_exclude_id: exclude && /^[0-9a-f-]{36}$/i.test(exclude) ? exclude : undefined });
  if (error) mapDbError(error, "slugAvailability");
  return json({ available: Boolean(data), slug: parsed.data });
});

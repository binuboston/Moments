import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, handle, json, mapDbError, readJson, requireAdmin } from "@/lib/api/respond";
import { uuid } from "@/lib/validation/common";

const patchSchema = z
  .object({
    name: z.string().trim().min(1).max(60),
    description: z.string().trim().max(300).nullable(),
    icon: z.string().trim().max(40).nullable(),
    sort_order: z.number().int().min(-1000).max(1000),
    is_active: z.boolean(),
  })
  .partial();

export const PATCH = handle(async (request: NextRequest, ctx: RouteContext<"/api/admin/categories/[id]">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { supabase } = await requireAdmin();
  const body = patchSchema.parse(await readJson(request));
  const { error } = await supabase.from("event_categories").update(body).eq("id", id);
  if (error) mapDbError(error, "admin.categories.update");
  revalidateTag("categories", "max");
  return json({ ok: true });
});

export const DELETE = handle(async (_req: NextRequest, ctx: RouteContext<"/api/admin/categories/[id]">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("event_categories").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") throw new ApiError(409, "This category is used by existing invitations. Deactivate it instead.", "in_use");
    mapDbError(error, "admin.categories.delete");
  }
  revalidateTag("categories", "max");
  return json({ ok: true });
});

import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, json, mapDbError, readJson, requireAdmin } from "@/lib/api/respond";
import { uuid } from "@/lib/validation/common";

const patchSchema = z
  .object({
    status: z.enum(["draft", "published", "archived"]),
    tier: z.enum(["free", "premium"]),
    is_featured: z.boolean(),
    sort_order: z.number().int().min(-1000).max(1000),
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(400).nullable(),
  })
  .partial();

export const PATCH = handle(async (request: NextRequest, ctx: RouteContext<"/api/admin/templates/[id]">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { supabase } = await requireAdmin();
  const body = patchSchema.parse(await readJson(request));
  const { error } = await supabase.from("templates").update(body).eq("id", id);
  if (error) mapDbError(error, "admin.templates.update");
  revalidateTag("templates", "max");
  return json({ ok: true });
});

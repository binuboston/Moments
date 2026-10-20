import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, handle, json, mapDbError, readJson, requireAdmin } from "@/lib/api/respond";
import { uuid } from "@/lib/validation/common";
import { removeInvitationStorage } from "@/features/invitations/server-actions-helpers";

const patchSchema = z.object({ status: z.enum(["unpublished"]) });

export const PATCH = handle(async (request: NextRequest, ctx: RouteContext<"/api/admin/invitations/[id]">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { supabase } = await requireAdmin();
  const body = patchSchema.parse(await readJson(request));
  const { data: existing } = await supabase.from("invitations").select("slug").eq("id", id).maybeSingle();
  if (!existing) throw new ApiError(404, "Invitation not found.", "not_found");
  const { error } = await supabase.from("invitations").update({ status: body.status }).eq("id", id);
  if (error) mapDbError(error, "admin.invitations.update");
  revalidatePath(`/e/${existing.slug}`);
  return json({ ok: true });
});

export const DELETE = handle(async (_req: NextRequest, ctx: RouteContext<"/api/admin/invitations/[id]">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { supabase } = await requireAdmin();
  const { data: existing } = await supabase.from("invitations").select("slug").eq("id", id).maybeSingle();
  if (!existing) throw new ApiError(404, "Invitation not found.", "not_found");
  await removeInvitationStorage(supabase, id);
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) mapDbError(error, "admin.invitations.delete");
  revalidatePath(`/e/${existing.slug}`);
  return json({ ok: true });
});

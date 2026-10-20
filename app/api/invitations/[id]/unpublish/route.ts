import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { ApiError, handle, json, mapDbError, requireUser } from "@/lib/api/respond";
import { uuid } from "@/lib/validation/common";

export const POST = handle(async (_req: NextRequest, ctx: RouteContext<"/api/invitations/[id]/unpublish">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { user, supabase } = await requireUser();
  const { data: existing } = await supabase.from("invitations").select("id, slug, status").eq("id", id).eq("owner_id", user.id).maybeSingle();
  if (!existing) throw new ApiError(404, "Invitation not found.", "not_found");
  if (existing.status !== "published") throw new ApiError(409, "This invitation is not published.", "not_published");

  const { error } = await supabase.from("invitations").update({ status: "unpublished" }).eq("id", id).eq("owner_id", user.id);
  if (error) mapDbError(error, "unpublishInvitation");
  revalidatePath(`/e/${existing.slug}`);
  return json({ ok: true });
});

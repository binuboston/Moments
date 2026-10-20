import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, handle, json, mapDbError, readJson, requireUser } from "@/lib/api/respond";
import { uuid } from "@/lib/validation/common";
import type { TablesUpdate } from "@/types/domain";

const patchSchema = z
  .object({
    uploaded: z.literal(true),
    alt: z.string().trim().max(200),
    sortOrder: z.number().int().min(0).max(500),
    kind: z.enum(["cover", "gallery"]),
  })
  .partial();

async function loadOwned(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"], id: string, userId: string) {
  const { data } = await supabase.from("invitation_media").select("*, invitations!inner(slug, status)").eq("id", id).eq("owner_id", userId).maybeSingle();
  if (!data) throw new ApiError(404, "Photo not found.", "not_found");
  return data;
}

export const PATCH = handle(async (request: NextRequest, ctx: RouteContext<"/api/media/[id]">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { user, supabase } = await requireUser();
  const body = patchSchema.parse(await readJson(request));
  const media = await loadOwned(supabase, id, user.id);

  const update: TablesUpdate<"invitation_media"> = {};
  if (body.uploaded) {
    // Confirm the object really exists before exposing it.
    const folder = media.storage_path.split("/")[0];
    const name = media.storage_path.split("/")[1];
    const { data: files } = await supabase.storage.from("invitation-media").list(folder, { search: name, limit: 1 });
    if (!files?.some((f) => f.name === name)) throw new ApiError(409, "Upload has not completed yet.", "upload_missing");
    update.is_uploaded = true;
  }
  if (body.alt !== undefined) update.alt = body.alt || null;
  if (body.sortOrder !== undefined) update.sort_order = body.sortOrder;
  if (body.kind !== undefined) {
    if (body.kind === "cover") {
      // Only one cover: demote any existing cover to the gallery.
      await supabase.from("invitation_media").update({ kind: "gallery" }).eq("invitation_id", media.invitation_id).eq("kind", "cover").neq("id", id);
    }
    update.kind = body.kind;
  }

  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from("invitation_media").update(update).eq("id", id).eq("owner_id", user.id);
    if (error) mapDbError(error, "media.update");
  }
  if (media.invitations.status === "published") revalidatePath(`/e/${media.invitations.slug}`);
  return json({ ok: true });
});

export const DELETE = handle(async (_req: NextRequest, ctx: RouteContext<"/api/media/[id]">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { user, supabase } = await requireUser();
  const media = await loadOwned(supabase, id, user.id);

  const { error: storageError } = await supabase.storage.from("invitation-media").remove([media.storage_path]);
  if (storageError) console.warn("[media] storage remove failed:", storageError.message);
  const { error } = await supabase.from("invitation_media").delete().eq("id", id).eq("owner_id", user.id);
  if (error) mapDbError(error, "media.delete");
  if (media.invitations.status === "published") revalidatePath(`/e/${media.invitations.slug}`);
  return json({ ok: true });
});

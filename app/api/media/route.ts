import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ApiError, handle, json, mapDbError, readJson, requireUser } from "@/lib/api/respond";
import { maxGalleryImages } from "@/lib/entitlements";
import { uuid } from "@/lib/validation/common";
import { getProfilePlan } from "@/features/invitations/server-actions-helpers";

export const ALLOWED_MIME = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as const;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const createMediaSchema = z.object({
  invitationId: uuid,
  kind: z.enum(["cover", "gallery"]),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  sizeBytes: z.number().int().positive().max(MAX_IMAGE_BYTES),
  width: z.number().int().positive().max(12000).nullable().default(null),
  height: z.number().int().positive().max(12000).nullable().default(null),
  alt: z.string().trim().max(200).default(""),
});

/**
 * Step 1 of an upload: validates, reserves a storage path and creates a pending
 * media row. The browser then uploads directly to Storage (RLS-checked) and
 * confirms with PATCH /api/media/[id].
 */
export const POST = handle(async (request: Request) => {
  const { user, supabase } = await requireUser();
  const body = createMediaSchema.parse(await readJson(request));

  const { data: inv } = await supabase.from("invitations").select("id").eq("id", body.invitationId).eq("owner_id", user.id).maybeSingle();
  if (!inv) throw new ApiError(404, "Invitation not found.", "not_found");

  const { plan } = await getProfilePlan(supabase, user.id);
  if (body.kind === "gallery") {
    const { count } = await supabase.from("invitation_media").select("id", { count: "exact", head: true }).eq("invitation_id", body.invitationId).eq("kind", "gallery");
    if ((count ?? 0) >= maxGalleryImages(plan)) {
      throw new ApiError(403, `Your plan allows up to ${maxGalleryImages(plan)} gallery photos.`, "plan_limit");
    }
  }

  const ext = ALLOWED_MIME[body.mimeType];
  const storagePath = `${body.invitationId}/${randomUUID()}.${ext}`;
  const { data: maxRow } = await supabase.from("invitation_media").select("sort_order").eq("invitation_id", body.invitationId).order("sort_order", { ascending: false }).limit(1).maybeSingle();

  const { data, error } = await supabase
    .from("invitation_media")
    .insert({
      invitation_id: body.invitationId,
      owner_id: user.id,
      storage_path: storagePath,
      kind: body.kind,
      mime_type: body.mimeType,
      size_bytes: body.sizeBytes,
      width: body.width,
      height: body.height,
      alt: body.alt || null,
      sort_order: (maxRow?.sort_order ?? -1) + 1,
      is_uploaded: false,
    })
    .select("id, storage_path")
    .single();
  if (error) mapDbError(error, "media.create");

  return json({ id: data.id, path: data.storage_path, bucket: "invitation-media" }, 201);
});

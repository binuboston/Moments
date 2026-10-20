import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { ApiError, handle, json, mapDbError, readJson, requireUser } from "@/lib/api/respond";
import { uuid } from "@/lib/validation/common";
import { updateInvitationSchema } from "@/lib/validation/invitation";
import { brandingForPlan, getOwnedInvitationDraft } from "@/features/invitations/queries";
import { getProfilePlan, removeInvitationStorage, replaceFunctions, resolveTemplate } from "@/features/invitations/server-actions-helpers";
import type { TablesUpdate } from "@/types/domain";

export const GET = handle(async (_req: NextRequest, ctx: RouteContext<"/api/invitations/[id]">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { user, supabase } = await requireUser();
  const { plan } = await getProfilePlan(supabase, user.id);
  const draft = await getOwnedInvitationDraft(supabase, id, user.id, plan);
  if (!draft) throw new ApiError(404, "Invitation not found.", "not_found");
  return json(draft);
});

export const PATCH = handle(async (request: NextRequest, ctx: RouteContext<"/api/invitations/[id]">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { user, supabase } = await requireUser();
  const body = updateInvitationSchema.parse(await readJson(request));

  // Confirm ownership first so later errors are not confused with 404s.
  const { data: existing, error: loadError } = await supabase
    .from("invitations")
    .select("id, slug, status, category_id, event_categories!inner(slug)")
    .eq("id", id)
    .eq("owner_id", user.id)
    .maybeSingle();
  if (loadError) mapDbError(loadError, "updateInvitation.load");
  if (!existing) throw new ApiError(404, "Invitation not found.", "not_found");

  const { plan } = await getProfilePlan(supabase, user.id);
  const update: TablesUpdate<"invitations"> = {};
  if (body.title !== undefined) update.title = body.title;
  if (body.content !== undefined) {
    if (body.content.kind !== existing.event_categories.slug) throw new ApiError(400, "Content type does not match the invitation's event type.", "kind_mismatch");
    update.content = body.content as unknown as Record<string, never>;
  }
  if (body.theme !== undefined) update.theme = body.theme as unknown as Record<string, never>;
  // Branding is a plan decision, never a user choice; keep it current on every settings write.
  if (body.settings !== undefined) update.settings = { ...body.settings, branding: brandingForPlan(plan) } as unknown as Record<string, never>;
  if (body.slug !== undefined) update.slug = body.slug;
  if (body.templateSlug !== undefined) {
    const template = await resolveTemplate(supabase, body.templateSlug);
    if (!template.category_slugs.includes(existing.event_categories.slug)) {
      throw new ApiError(400, "That template does not support this event type.", "template_category_mismatch");
    }
    update.template_id = template.id;
  }

  if (Object.keys(update).length > 0) {
    const { data: updated, error } = await supabase.from("invitations").update(update).eq("id", id).eq("owner_id", user.id).select("id");
    if (error) mapDbError(error, "updateInvitation.update");
    if (!updated || updated.length === 0) throw new ApiError(404, "Invitation not found.", "not_found");
  }
  if (body.functions !== undefined) {
    await replaceFunctions(supabase, id, body.functions);
  }

  if (existing.status === "published") {
    revalidatePath(`/e/${existing.slug}`);
    if (body.slug && body.slug !== existing.slug) revalidatePath(`/e/${body.slug}`);
  }

  const draft = await getOwnedInvitationDraft(supabase, id, user.id, plan);
  return json(draft);
});

export const DELETE = handle(async (_req: NextRequest, ctx: RouteContext<"/api/invitations/[id]">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { user, supabase } = await requireUser();
  const { data: existing } = await supabase.from("invitations").select("id, slug, status").eq("id", id).eq("owner_id", user.id).maybeSingle();
  if (!existing) throw new ApiError(404, "Invitation not found.", "not_found");

  await removeInvitationStorage(supabase, id);
  const { error } = await supabase.from("invitations").delete().eq("id", id).eq("owner_id", user.id);
  if (error) mapDbError(error, "deleteInvitation");
  if (existing.status === "published") revalidatePath(`/e/${existing.slug}`);
  return json({ ok: true });
});

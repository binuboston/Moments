import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { ApiError, handle, json, mapDbError, requireAccount } from "@/lib/api/respond";
import { siteUrl } from "@/lib/env";
import { uuid } from "@/lib/validation/common";
import { publishableSchema } from "@/lib/validation/invitation";
import { withDerivedHeadline } from "@/lib/validation/content";
import { getOwnedInvitationDraft, brandingForPlan } from "@/features/invitations/queries";
import { assertCanPublishAnother, assertTemplateAllowed, getProfilePlan } from "@/features/invitations/server-actions-helpers";

export const POST = handle(async (_req: NextRequest, ctx: RouteContext<"/api/invitations/[id]/publish">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  // Guests can design and save drafts, but publishing needs an account.
  const { user, supabase } = await requireAccount();
  const { plan } = await getProfilePlan(supabase, user.id);
  const draft = await getOwnedInvitationDraft(supabase, id, user.id, plan);
  if (!draft) throw new ApiError(404, "Invitation not found.", "not_found");

  // Strict validation: every required field for this event type must be present.
  const result = publishableSchema.safeParse({ content: withDerivedHeadline(draft.content), theme: draft.theme, settings: draft.settings, functions: draft.functions });
  if (!result.success) {
    throw new ApiError(
      422,
      "Some required details are missing or invalid.",
      "not_publishable",
      result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    );
  }

  assertTemplateAllowed(plan, draft.templateTier);
  if (draft.status !== "published") await assertCanPublishAnother(supabase, user.id, plan, id);

  const settings = { ...result.data.settings, branding: brandingForPlan(plan) };
  const title = draft.title || result.data.content.headline;

  const { data: updated, error } = await supabase
    .from("invitations")
    .update({
      status: "published",
      published_at: draft.publishedAt ?? new Date().toISOString(),
      settings: settings as unknown as Record<string, never>,
      content: result.data.content as unknown as Record<string, never>,
      title,
    })
    .eq("id", id)
    .eq("owner_id", user.id)
    .select("id");
  if (error) mapDbError(error, "publishInvitation");
  if (!updated || updated.length === 0) throw new ApiError(404, "Invitation not found.", "not_found");

  revalidatePath(`/e/${draft.slug}`);
  return json({ ok: true, slug: draft.slug, url: siteUrl(`/e/${draft.slug}`) });
});

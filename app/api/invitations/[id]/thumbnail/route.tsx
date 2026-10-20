import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { InvitationCardImage } from "@/features/invitations/card-image";
import { draftToView } from "@/features/invitations/mappers";
import { getOwnedInvitationDraft } from "@/features/invitations/queries";
import { getProfilePlan } from "@/features/invitations/server-actions-helpers";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { showsBranding } from "@/lib/entitlements";
import { uuid } from "@/lib/validation/common";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

/**
 * Owner-only card image for dashboard thumbnails (drafts included).
 * Same renderer as the public Open Graph image. Clients append ?v=<updatedAt>
 * so each saved version is a new, privately cacheable URL.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/invitations/[id]/thumbnail">) {
  const { id } = await ctx.params;
  if (!uuid.safeParse(id).success) return new Response("Not found", { status: 404 });
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const supabase = await createClient();
  const { plan } = await getProfilePlan(supabase, user.id);
  const draft = await getOwnedInvitationDraft(supabase, id, user.id, plan);
  if (!draft) return new Response("Not found", { status: 404 });

  const view = draftToView({
    id: draft.id,
    slug: draft.slug,
    status: draft.status,
    categorySlug: draft.categorySlug,
    templateKey: draft.templateKey,
    templateName: getTemplateOrFallback(draft.templateKey).name,
    templateTier: draft.templateTier,
    content: draft.content,
    theme: draft.theme,
    settings: draft.settings,
    functions: draft.functions,
    media: draft.media,
    publicUrl: draft.publicUrl,
    showBranding: showsBranding(plan),
  });

  const versioned = new URL(request.url).searchParams.has("v");
  return new ImageResponse(<InvitationCardImage view={view} />, {
    width: 1200,
    height: 630,
    headers: { "Cache-Control": versioned ? "private, max-age=31536000, immutable" : "private, no-store" },
  });
}

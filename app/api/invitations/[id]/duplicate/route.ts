import type { NextRequest } from "next/server";
import { ApiError, handle, json, mapDbError, requireUser } from "@/lib/api/respond";
import { uuid } from "@/lib/validation/common";
import { uniqueSlug } from "@/features/invitations/server-actions-helpers";

export const POST = handle(async (_req: NextRequest, ctx: RouteContext<"/api/invitations/[id]/duplicate">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { user, supabase } = await requireUser();
  const { data: source, error } = await supabase.from("invitations").select("*, invitation_functions(*)").eq("id", id).eq("owner_id", user.id).maybeSingle();
  if (error) mapDbError(error, "duplicate.load");
  if (!source) throw new ApiError(404, "Invitation not found.", "not_found");

  const headline = (source.content as { headline?: string } | null)?.headline ?? "";
  const slug = await uniqueSlug(supabase, headline, "invitation");
  const { data: created, error: insertError } = await supabase
    .from("invitations")
    .insert({
      owner_id: user.id,
      template_id: source.template_id,
      category_id: source.category_id,
      slug,
      title: source.title ? `${source.title} (copy)` : "",
      status: "draft",
      content: source.content,
      theme: source.theme,
      settings: source.settings,
    })
    .select("id, slug")
    .single();
  if (insertError) mapDbError(insertError, "duplicate.insert");

  if (source.invitation_functions.length > 0) {
    const { error: fnError } = await supabase.from("invitation_functions").insert(
      source.invitation_functions.map((f) => ({
        invitation_id: created.id,
        name: f.name,
        description: f.description,
        starts_at: f.starts_at,
        ends_at: f.ends_at,
        timezone: f.timezone,
        venue_name: f.venue_name,
        address: f.address,
        maps_url: f.maps_url,
        dress_code: f.dress_code,
        sort_order: f.sort_order,
      })),
    );
    if (fnError) mapDbError(fnError, "duplicate.functions");
  }
  // Media is intentionally not duplicated: storage objects belong to the source invitation.
  return json({ id: created.id, slug: created.slug }, 201);
});

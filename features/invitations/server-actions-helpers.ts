import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { ApiError, mapDbError } from "@/lib/api/respond";
import { canUseTemplate, maxActiveInvitations } from "@/lib/entitlements";
import { generateSlug } from "@/lib/utils/slug";
import type { InvitationFunctionInput } from "@/lib/validation/functions";
import { getTemplate } from "@/features/templates/registry";

type Client = SupabaseClient<Database>;

export async function getProfilePlan(client: Client, userId: string) {
  const { data } = await client.from("profiles").select("plan, role").eq("id", userId).maybeSingle();
  return { plan: data?.plan ?? ("free" as const), role: data?.role ?? ("user" as const) };
}

export async function resolveTemplate(client: Client, templateSlug: string) {
  const { data, error } = await client.from("templates").select("id, slug, renderer_key, name, tier, status, category_slugs").eq("slug", templateSlug).maybeSingle();
  if (error) mapDbError(error, "resolveTemplate");
  if (!data || data.status !== "published") throw new ApiError(404, "That template is not available.", "template_not_found");
  if (!getTemplate(data.renderer_key)) throw new ApiError(500, "Template renderer is missing.", "template_renderer_missing");
  return data;
}

export async function resolveCategory(client: Client, categorySlug: string) {
  const { data, error } = await client.from("event_categories").select("id, slug, name, is_active").eq("slug", categorySlug).maybeSingle();
  if (error) mapDbError(error, "resolveCategory");
  if (!data || !data.is_active) throw new ApiError(404, "That event type is not available.", "category_not_found");
  return data;
}

export function assertTemplateAllowed(plan: "free" | "pro", tier: "free" | "premium") {
  if (!canUseTemplate(plan, tier)) {
    throw new ApiError(403, "This is a premium template. Upgrade to Pro to publish with it.", "premium_required");
  }
}

export async function assertCanPublishAnother(client: Client, ownerId: string, plan: "free" | "pro", excludingId: string) {
  const { count } = await client.from("invitations").select("id", { count: "exact", head: true }).eq("owner_id", ownerId).eq("status", "published").neq("id", excludingId);
  if ((count ?? 0) >= maxActiveInvitations(plan)) {
    throw new ApiError(403, `Your plan allows ${maxActiveInvitations(plan)} live invitations. Unpublish one to publish another.`, "plan_limit");
  }
}

/** Generates a slug and retries on collision. */
export async function uniqueSlug(client: Client, headline: string, fallback: string): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateSlug(headline, fallback);
    const { data } = await client.from("invitations").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  throw new ApiError(500, "Could not generate a unique address. Please try again.", "slug_generation_failed");
}

/** Replaces the function list for an invitation. RLS guarantees ownership of the parent. */
export async function replaceFunctions(client: Client, invitationId: string, functions: InvitationFunctionInput[]) {
  const { error: delError } = await client.from("invitation_functions").delete().eq("invitation_id", invitationId);
  if (delError) mapDbError(delError, "replaceFunctions.delete");
  if (functions.length === 0) return;
  const rows = functions.map((f, i) => ({
    invitation_id: invitationId,
    name: f.name,
    description: f.description || null,
    starts_at: f.startsAt,
    ends_at: f.endsAt || null,
    timezone: f.timezone ?? "UTC",
    venue_name: f.venueName || null,
    address: f.address || null,
    maps_url: f.mapsUrl || null,
    dress_code: f.dressCode || null,
    sort_order: f.sortOrder ?? i,
  }));
  const { error } = await client.from("invitation_functions").insert(rows);
  if (error) mapDbError(error, "replaceFunctions.insert");
}

export async function removeInvitationStorage(client: Client, invitationId: string) {
  const { data: files } = await client.storage.from("invitation-media").list(invitationId, { limit: 200 });
  if (files && files.length > 0) {
    await client.storage.from("invitation-media").remove(files.map((f) => `${invitationId}/${f.name}`));
  }
}

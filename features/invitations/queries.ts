import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { CategorySlug, InvitationMediaRow, InvitationStatus, PlanTier } from "@/types/domain";
import { siteUrl } from "@/lib/env";
import { createAnonClient } from "@/lib/supabase/server";
import { showsBranding } from "@/lib/entitlements";
import { getTemplate } from "@/features/templates/registry";
import type { InvitationView } from "@/features/templates/types";
import { displayTitle, draftToView, functionRowToInput, isCategorySlug, looseContent, parseSettings, parseTheme, rowStartsAt, rowTimezone } from "@/features/invitations/mappers";
import type { InvitationDraft, InvitationListItem, InvitationListResponse, MediaRecord } from "@/features/invitations/types";
import { routes } from "@/lib/routes";
import type { ContentKind } from "@/lib/validation/content";

export const MEDIA_BUCKET = "invitation-media";
/** Signed URLs outlive the page cache (5 min) by a wide margin. */
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7;

type Client = SupabaseClient<Database>;

export async function signMedia(client: Client, rows: InvitationMediaRow[]): Promise<MediaRecord[]> {
  const uploaded = rows.filter((r) => r.is_uploaded);
  const urls = new Map<string, string>();
  if (uploaded.length > 0) {
    const { data, error } = await client.storage.from(MEDIA_BUCKET).createSignedUrls(
      uploaded.map((r) => r.storage_path),
      SIGNED_URL_TTL_SECONDS,
    );
    if (error) {
      console.warn("[media] failed to sign urls:", error.message);
    } else {
      for (const item of data ?? []) {
        if (item.path && item.signedUrl) urls.set(item.path, item.signedUrl);
      }
    }
  }
  return rows
    .map((r) => ({
      id: r.id,
      kind: r.kind,
      url: urls.get(r.storage_path) ?? "",
      storagePath: r.storage_path,
      width: r.width,
      height: r.height,
      alt: r.alt ?? "",
      sortOrder: r.sort_order,
      isUploaded: r.is_uploaded,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

const DRAFT_SELECT = "*, templates!inner(slug, renderer_key, name, tier), event_categories!inner(slug, name), invitation_functions(*), invitation_media(*)" as const;

/**
 * Loads an invitation the given user owns, with everything the editor needs.
 * Filters by owner explicitly in addition to RLS: published rows are readable
 * by the anonymous role, so "exists" never implies "owned".
 */
export async function getOwnedInvitationDraft(client: Client, id: string, ownerId: string, plan: PlanTier): Promise<InvitationDraft | null> {
  const { data, error } = await client.from("invitations").select(DRAFT_SELECT).eq("id", id).eq("owner_id", ownerId).maybeSingle();
  if (error) throw new Error(`Failed to load invitation: ${error.message}`);
  if (!data) return null;
  const categorySlug = data.event_categories.slug;
  if (!isCategorySlug(categorySlug)) return null;
  const media = await signMedia(client, data.invitation_media);
  return {
    id: data.id,
    slug: data.slug,
    status: data.status,
    title: data.title,
    categorySlug,
    categoryName: data.event_categories.name,
    templateKey: data.templates.renderer_key,
    templateSlug: data.templates.slug,
    templateTier: data.templates.tier,
    content: looseContent(categorySlug, data.content, rowTimezone(data)),
    theme: parseTheme(data.theme),
    settings: parseSettings(data.settings),
    functions: [...data.invitation_functions].sort((a, b) => a.sort_order - b.sort_order).map(functionRowToInput),
    media,
    publishedAt: data.published_at,
    updatedAt: data.updated_at,
    createdAt: data.created_at,
    publicUrl: siteUrl(routes.invitation(data.slug)),
    plan,
  };
}

export interface ListParams {
  status: "all" | InvitationStatus;
  page: number;
  pageSize: number;
}

export async function listOwnedInvitations(client: Client, ownerId: string, params: ListParams): Promise<InvitationListResponse> {
  const from = (params.page - 1) * params.pageSize;
  let query = client
    .from("invitations")
    .select("id, slug, title, status, content, settings, published_at, updated_at, templates!inner(renderer_key, name), event_categories!inner(slug, name)", { count: "exact" })
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false })
    .range(from, from + params.pageSize - 1);
  if (params.status !== "all") query = query.eq("status", params.status);

  const [{ data, error, count }, countsResult] = await Promise.all([
    query,
    client.from("invitations").select("status").eq("owner_id", ownerId),
  ]);
  if (error) throw new Error(`Failed to list invitations: ${error.message}`);

  const counts = { all: 0, draft: 0, published: 0, unpublished: 0 };
  for (const row of countsResult.data ?? []) {
    counts.all += 1;
    counts[row.status] += 1;
  }

  const items: InvitationListItem[] = (data ?? []).map((row) => {
    const settings = parseSettings(row.settings);
    const categorySlug = row.event_categories.slug;
    return {
      id: row.id,
      slug: row.slug,
      title: displayTitle(row, (isCategorySlug(categorySlug) ? categorySlug : "party") as ContentKind),
      status: row.status,
      categorySlug: (isCategorySlug(categorySlug) ? categorySlug : "party") as CategorySlug,
      categoryName: row.event_categories.name,
      templateKey: row.templates.renderer_key,
      templateName: row.templates.name,
      startsAt: rowStartsAt(row),
      timezone: rowTimezone(row),
      rsvpEnabled: settings.rsvp.enabled,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      publicUrl: siteUrl(routes.invitation(row.slug)),
    };
  });

  return { items, total: count ?? items.length, page: params.page, pageSize: params.pageSize, counts };
}

/** Public, anonymous read of a published invitation. Returns null for drafts, unpublished and unknown slugs. */
export async function getPublishedInvitationView(slug: string): Promise<InvitationView | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("invitations")
    .select(
      "id, slug, title, status, content, theme, settings, published_at, expires_at, template_id, category_id, templates!inner(renderer_key, name, tier), event_categories!inner(slug), invitation_functions(*), invitation_media(id, invitation_id, storage_path, kind, mime_type, width, height, alt, sort_order, is_uploaded, created_at)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) {
    console.error("[public] failed to load invitation:", error.message);
    return null;
  }
  if (!data) return null;
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return null;
  const categorySlug = data.event_categories.slug;
  if (!isCategorySlug(categorySlug)) return null;
  if (!getTemplate(data.templates.renderer_key)) return null;

  const mediaRows = data.invitation_media.map((m) => ({ ...m, owner_id: "", size_bytes: 0 })) as InvitationMediaRow[];
  const media = await signMedia(supabase, mediaRows);

  // Branding is decided by the owner's plan. Owner plan is not readable anonymously,
  // so publish stores the decision in settings (see publish route). Default to showing it.
  const settings = data.settings as { branding?: boolean } | null;
  const showBranding = settings?.branding ?? true;

  return draftToView({
    id: data.id,
    slug: data.slug,
    status: data.status,
    categorySlug,
    templateKey: data.templates.renderer_key,
    templateName: data.templates.name,
    templateTier: data.templates.tier,
    content: data.content,
    theme: data.theme,
    settings: data.settings,
    functions: [...data.invitation_functions].sort((a, b) => a.sort_order - b.sort_order).map(functionRowToInput),
    media,
    publicUrl: siteUrl(routes.invitation(data.slug)),
    showBranding,
  });
}

/** Resolves branding for an owner at publish time. */
export function brandingForPlan(plan: PlanTier): boolean {
  return showsBranding(plan);
}

export interface OverviewSummary {
  upcoming: number;
  /** The soonest event that has not started yet. */
  next: { id: string; title: string; status: InvitationStatus; startsAt: string; timezone: string; publicUrl: string } | null;
}

/** Upcoming-event figures for the dashboard overview, across all of the owner's invitations. */
export async function getOverviewSummary(client: Client, ownerId: string, now = Date.now()): Promise<OverviewSummary> {
  const { data, error } = await client.from("invitations").select("id, slug, title, status, content").eq("owner_id", ownerId);
  if (error) throw new Error(`Failed to load overview: ${error.message}`);
  const upcoming = (data ?? [])
    .map((row) => ({ row, startsAt: rowStartsAt(row) }))
    .filter((r): r is { row: (typeof data)[number]; startsAt: string } => Boolean(r.startsAt) && new Date(r.startsAt!).getTime() > now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const first = upcoming[0];
  return {
    upcoming: upcoming.length,
    next: first
      ? { id: first.row.id, title: displayTitle(first.row, ((first.row.content as { kind?: ContentKind } | null)?.kind ?? "party")) || "Untitled invitation", status: first.row.status, startsAt: first.startsAt, timezone: rowTimezone(first.row), publicUrl: siteUrl(routes.invitation(first.row.slug)) }
      : null,
  };
}

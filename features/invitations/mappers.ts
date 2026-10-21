import type { CategorySlug, InvitationFunctionRow, InvitationRow } from "@/types/domain";
import { CATEGORY_SLUGS } from "@/types/domain";
import { contentSchema, emptyContent, withDerivedHeadline, type ContentKind, type InvitationContent, type InvitationContentInput } from "@/lib/validation/content";
import type { InvitationFunction, InvitationFunctionInput } from "@/lib/validation/functions";
import { settingsSchema, type InvitationSettings } from "@/lib/validation/settings";
import { themeSchema, type ThemeInput } from "@/lib/validation/theme";
import { nextRoundHourIso } from "@/lib/utils/dates";
import type { InvitationView, MediaItem } from "@/features/templates/types";
import type { MediaRecord } from "@/features/invitations/types";

export function isCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}

export function parseTheme(raw: unknown): ThemeInput {
  const parsed = themeSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : themeSchema.parse({});
}

export function parseSettings(raw: unknown): InvitationSettings {
  const parsed = settingsSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : settingsSchema.parse({});
}

/** Loose content for the editor: keeps whatever the user typed, fills gaps with empties. */
export function looseContent(kind: ContentKind, raw: unknown, timezone = "UTC"): InvitationContentInput {
  const base = emptyContent(kind, nextRoundHourIso(timezone), timezone);
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return { ...base, ...obj, kind } as InvitationContentInput;
}

/**
 * The name people see for an invitation in lists: its title, else the
 * headline, else one built from the names typed in (drafts rarely have a
 * title yet). "" when there is nothing to show.
 */
export function displayTitle(row: { title: string; content: unknown }, kind: ContentKind): string {
  if (row.title.trim()) return row.title;
  const content = row.content && typeof row.content === "object" ? (row.content as Record<string, unknown>) : {};
  return withDerivedHeadline({ ...content, kind } as { kind: ContentKind; headline?: string }).headline?.trim() ?? "";
}

const REQUIRED_BY_KIND: Record<ContentKind, string[]> = {
  wedding: ["partnerOne", "partnerTwo"],
  engagement: ["partnerOne", "partnerTwo"],
  birthday: ["celebrantName"],
  anniversary: ["partnerOne", "partnerTwo"],
  "baby-shower": ["parentNames"],
  housewarming: ["hostNames"],
  party: [],
  corporate: ["organisation"],
};

const PLACEHOLDERS: Record<string, string> = {
  headline: "Your event title",
  partnerOne: "Partner one",
  partnerTwo: "Partner two",
  celebrantName: "Guest of honour",
  parentNames: "The parents-to-be",
  hostNames: "Your hosts",
  organisation: "Your organisation",
};

/**
 * Strict content for rendering a preview of an incomplete draft. Missing
 * required fields get placeholders; invalid optional fields are dropped.
 */
export function previewContent(kind: ContentKind, raw: unknown, timezone = "UTC"): InvitationContent {
  const loose = withDerivedHeadline(looseContent(kind, raw, timezone)) as unknown as Record<string, unknown>;
  for (const key of ["headline", ...REQUIRED_BY_KIND[kind]]) {
    if (typeof loose[key] !== "string" || !(loose[key] as string).trim()) loose[key] = PLACEHOLDERS[key] ?? "—";
  }
  const first = contentSchema.safeParse(loose);
  if (first.success) return first.data;

  // Drop fields that failed and retry with defaults for them.
  for (const issue of first.error.issues) {
    const top = issue.path[0];
    if (typeof top === "string" && top !== "kind") {
      const base = emptyContent(kind, nextRoundHourIso(timezone), timezone) as unknown as Record<string, unknown>;
      loose[top] = base[top];
    }
  }
  const second = contentSchema.safeParse(loose);
  if (second.success) return second.data;
  const fallback = emptyContent(kind, nextRoundHourIso(timezone), timezone) as unknown as Record<string, unknown>;
  for (const key of ["headline", ...REQUIRED_BY_KIND[kind]]) fallback[key] = PLACEHOLDERS[key] ?? "—";
  return contentSchema.parse(fallback);
}

export function functionRowToInput(row: InvitationFunctionRow): InvitationFunctionInput {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? "",
    timezone: row.timezone,
    venueName: row.venue_name ?? "",
    address: row.address ?? "",
    mapsUrl: row.maps_url ?? "",
    dressCode: row.dress_code ?? "",
    sortOrder: row.sort_order,
  };
}

export function functionInputToView(fn: InvitationFunctionInput): InvitationFunction {
  return {
    id: fn.id,
    name: fn.name,
    description: fn.description ?? "",
    startsAt: fn.startsAt,
    endsAt: fn.endsAt ?? "",
    timezone: fn.timezone ?? "UTC",
    venueName: fn.venueName ?? "",
    address: fn.address ?? "",
    mapsUrl: fn.mapsUrl ?? "",
    dressCode: fn.dressCode ?? "",
    sortOrder: fn.sortOrder ?? 0,
  };
}

export function mediaToView(media: MediaRecord[]): InvitationView["media"] {
  const uploaded = media.filter((m) => m.isUploaded && m.url);
  const cover = uploaded.find((m) => m.kind === "cover") ?? null;
  const gallery = uploaded.filter((m) => m.kind === "gallery").sort((a, b) => a.sortOrder - b.sortOrder);
  const toItem = (m: MediaRecord): MediaItem => ({ id: m.id, url: m.url, width: m.width, height: m.height, alt: m.alt });
  return { cover: cover ? toItem(cover) : null, gallery: gallery.map(toItem) };
}

/** Builds the renderer view from editor state. Tolerates incomplete drafts. */
export function draftToView(input: {
  id: string;
  slug: string;
  status: InvitationView["status"];
  categorySlug: CategorySlug;
  templateKey: string;
  templateName: string;
  templateTier: InvitationView["template"]["tier"];
  content: unknown;
  theme: unknown;
  settings: unknown;
  functions: InvitationFunctionInput[];
  media: MediaRecord[];
  publicUrl: string;
  showBranding: boolean;
}): InvitationView {
  const timezone = (input.content as { timezone?: string } | null)?.timezone ?? "UTC";
  return {
    id: input.id,
    slug: input.slug,
    status: input.status,
    category: input.categorySlug,
    content: previewContent(input.categorySlug, input.content, timezone),
    functions: input.functions.filter((f) => f.name && f.startsAt).map(functionInputToView),
    media: mediaToView(input.media),
    settings: parseSettings(input.settings),
    theme: parseTheme(input.theme),
    template: { key: input.templateKey, name: input.templateName, tier: input.templateTier },
    publicUrl: input.publicUrl,
    showBranding: input.showBranding,
  };
}

export function rowStartsAt(row: Pick<InvitationRow, "content">): string | null {
  const c = row.content as { startsAt?: unknown } | null;
  return typeof c?.startsAt === "string" ? c.startsAt : null;
}

export function rowTimezone(row: Pick<InvitationRow, "content">): string {
  const c = row.content as { timezone?: unknown } | null;
  return typeof c?.timezone === "string" ? c.timezone : "UTC";
}

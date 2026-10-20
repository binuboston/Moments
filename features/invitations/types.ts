import type { CategorySlug, InvitationStatus, PlanTier, TemplateTier } from "@/types/domain";
import type { InvitationContentInput } from "@/lib/validation/content";
import type { InvitationFunctionInput } from "@/lib/validation/functions";
import type { InvitationSettings } from "@/lib/validation/settings";
import type { ThemeInput } from "@/lib/validation/theme";

export interface MediaRecord {
  id: string;
  kind: "cover" | "gallery";
  url: string;
  storagePath: string;
  width: number | null;
  height: number | null;
  alt: string;
  sortOrder: number;
  isUploaded: boolean;
}

/** Everything the editor needs. Content is loose because drafts may be incomplete. */
export interface InvitationDraft {
  id: string;
  slug: string;
  status: InvitationStatus;
  title: string;
  categorySlug: CategorySlug;
  categoryName: string;
  templateKey: string;
  templateSlug: string;
  templateTier: TemplateTier;
  content: InvitationContentInput;
  theme: ThemeInput;
  settings: InvitationSettings;
  functions: InvitationFunctionInput[];
  media: MediaRecord[];
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
  publicUrl: string;
  plan: PlanTier;
}

export interface InvitationListItem {
  id: string;
  slug: string;
  title: string;
  status: InvitationStatus;
  categorySlug: CategorySlug;
  categoryName: string;
  templateKey: string;
  templateName: string;
  startsAt: string | null;
  timezone: string;
  rsvpEnabled: boolean;
  publishedAt: string | null;
  updatedAt: string;
  publicUrl: string;
}

export interface InvitationListResponse {
  items: InvitationListItem[];
  total: number;
  page: number;
  pageSize: number;
  counts: { all: number; draft: number; published: number; unpublished: number };
}

export interface RsvpSummary {
  total: number;
  yes: number;
  no: number;
  maybe: number;
  guests: number;
}

export interface RsvpItem {
  id: string;
  guestName: string;
  attendance: "yes" | "no" | "maybe";
  guestCount: number;
  message: string | null;
  dietaryNotes: string | null;
  contact: string | null;
  createdAt: string;
  updatedAt: string;
}

import type { Database } from "@/types/database";

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

export type Profile = Tables<"profiles">;
export type EventCategory = Tables<"event_categories">;
export type TemplateRow = Tables<"templates">;
export type InvitationRow = Tables<"invitations">;
export type InvitationFunctionRow = Tables<"invitation_functions">;
export type InvitationMediaRow = Tables<"invitation_media">;
export type RsvpRow = Tables<"rsvps">;

export type InvitationStatus = Enums<"invitation_status">;
export type TemplateTier = Enums<"template_tier">;
export type PlanTier = Enums<"plan_tier">;
export type Attendance = Enums<"attendance">;

export const CATEGORY_SLUGS = [
  "wedding",
  "engagement",
  "birthday",
  "anniversary",
  "baby-shower",
  "housewarming",
  "party",
  "corporate",
] as const;
export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export const SECTION_KEYS = [
  "opening",
  "hero",
  "intro",
  "countdown",
  "details",
  "schedule",
  "gallery",
  "rsvp",
  "contacts",
  "gifts",
  "message",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

/** Sections that every template must render and users cannot hide. */
export const REQUIRED_SECTIONS: readonly SectionKey[] = ["hero", "details"];

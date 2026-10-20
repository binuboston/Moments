import { z } from "zod";
import { httpsUrl, isoDateTime, optionalText, requiredText, timezone } from "@/lib/validation/common";

export const venueSchema = z.object({
  name: optionalText(160),
  address: optionalText(400),
  mapsUrl: httpsUrl,
});

export const contactSchema = z.object({
  name: requiredText(80),
  phone: optionalText(40),
  email: z.union([z.literal(""), z.email()]).default(""),
});

export const giftsSchema = z.object({
  note: optionalText(400),
  url: httpsUrl,
});

/** Fields shared by every event type. */
const baseShape = {
  headline: requiredText(120),
  subheading: optionalText(160),
  intro: optionalText(600),
  hosts: optionalText(200),
  message: optionalText(1200),
  startsAt: isoDateTime,
  endsAt: z.union([z.literal(""), isoDateTime]).default(""),
  timezone,
  venue: venueSchema.default({ name: "", address: "", mapsUrl: "" }),
  contacts: z.array(contactSchema).max(4).default([]),
  gifts: giftsSchema.default({ note: "", url: "" }),
  dressCode: optionalText(120),
};

export const weddingContentSchema = z.object({
  kind: z.literal("wedding"),
  ...baseShape,
  partnerOne: requiredText(80),
  partnerTwo: requiredText(80),
  familyOne: optionalText(160),
  familyTwo: optionalText(160),
});

export const engagementContentSchema = z.object({
  kind: z.literal("engagement"),
  ...baseShape,
  partnerOne: requiredText(80),
  partnerTwo: requiredText(80),
});

export const birthdayContentSchema = z.object({
  kind: z.literal("birthday"),
  ...baseShape,
  celebrantName: requiredText(80),
  age: z.union([z.literal(""), z.coerce.number().int().min(1).max(120)]).default(""),
});

export const anniversaryContentSchema = z.object({
  kind: z.literal("anniversary"),
  ...baseShape,
  partnerOne: requiredText(80),
  partnerTwo: requiredText(80),
  years: z.union([z.literal(""), z.coerce.number().int().min(1).max(100)]).default(""),
});

export const babyShowerContentSchema = z.object({
  kind: z.literal("baby-shower"),
  ...baseShape,
  parentNames: requiredText(120),
  babyName: optionalText(80),
  reveal: z.enum(["surprise", "boy", "girl"]).default("surprise"),
});

export const housewarmingContentSchema = z.object({
  kind: z.literal("housewarming"),
  ...baseShape,
  hostNames: requiredText(120),
});

export const partyContentSchema = z.object({
  kind: z.literal("party"),
  ...baseShape,
  hostNames: optionalText(120),
  occasion: optionalText(120),
});

export const corporateContentSchema = z.object({
  kind: z.literal("corporate"),
  ...baseShape,
  organisation: requiredText(120),
  agenda: optionalText(800),
});

export const contentSchema = z.discriminatedUnion("kind", [
  weddingContentSchema,
  engagementContentSchema,
  birthdayContentSchema,
  anniversaryContentSchema,
  babyShowerContentSchema,
  housewarmingContentSchema,
  partyContentSchema,
  corporateContentSchema,
]);

export type InvitationContent = z.infer<typeof contentSchema>;
export type InvitationContentInput = z.input<typeof contentSchema>;
export type ContentKind = InvitationContent["kind"];
export type ContentOf<K extends ContentKind> = Extract<InvitationContent, { kind: K }>;

export const contentSchemaByKind = {
  wedding: weddingContentSchema,
  engagement: engagementContentSchema,
  birthday: birthdayContentSchema,
  anniversary: anniversaryContentSchema,
  "baby-shower": babyShowerContentSchema,
  housewarming: housewarmingContentSchema,
  party: partyContentSchema,
  corporate: corporateContentSchema,
} as const;

/**
 * Drafts are saved continuously, so the editor stores partially valid content.
 * `draftContentSchema` keeps the shape but relaxes required fields; the strict
 * `contentSchema` is enforced at publish time.
 */
export const draftContentSchema = z
  .object({
    kind: z.enum(["wedding", "engagement", "birthday", "anniversary", "baby-shower", "housewarming", "party", "corporate"]),
  })
  .loose();

export function emptyContent(kind: ContentKind, startsAt: string, tz: string): InvitationContentInput {
  const base = {
    headline: "",
    subheading: "",
    intro: "",
    hosts: "",
    message: "",
    startsAt,
    endsAt: "",
    timezone: tz,
    venue: { name: "", address: "", mapsUrl: "" },
    contacts: [],
    gifts: { note: "", url: "" },
    dressCode: "",
  };
  switch (kind) {
    case "wedding":
      return { kind, ...base, partnerOne: "", partnerTwo: "", familyOne: "", familyTwo: "" };
    case "engagement":
      return { kind, ...base, partnerOne: "", partnerTwo: "" };
    case "birthday":
      return { kind, ...base, celebrantName: "", age: "" };
    case "anniversary":
      return { kind, ...base, partnerOne: "", partnerTwo: "", years: "" };
    case "baby-shower":
      return { kind, ...base, parentNames: "", babyName: "", reveal: "surprise" };
    case "housewarming":
      return { kind, ...base, hostNames: "" };
    case "party":
      return { kind, ...base, hostNames: "", occasion: "" };
    case "corporate":
      return { kind, ...base, organisation: "", agenda: "" };
  }
}

/** Suggests a headline from category-specific fields when the user has not typed one. */
export function suggestHeadline(content: Partial<InvitationContentInput> & { kind: ContentKind }): string {
  switch (content.kind) {
    case "wedding":
    case "engagement":
    case "anniversary": {
      const a = (content as { partnerOne?: string }).partnerOne?.trim();
      const b = (content as { partnerTwo?: string }).partnerTwo?.trim();
      return a && b ? `${a} & ${b}` : a || b || "";
    }
    case "birthday": {
      const c = content as { celebrantName?: string; age?: number | "" };
      const name = c.celebrantName?.trim();
      if (!name) return "";
      return c.age ? `${name} turns ${c.age}` : `${name}'s birthday`;
    }
    case "baby-shower": {
      const c = content as { parentNames?: string; babyName?: string };
      return c.babyName?.trim() ? `Welcoming ${c.babyName.trim()}` : c.parentNames?.trim() ? `A shower for ${c.parentNames.trim()}` : "";
    }
    case "housewarming": {
      const c = content as { hostNames?: string };
      return c.hostNames?.trim() ? `${c.hostNames.trim()}'s new home` : "";
    }
    case "party": {
      const c = content as { occasion?: string; hostNames?: string };
      return c.occasion?.trim() || (c.hostNames?.trim() ? `${c.hostNames.trim()} invite you` : "");
    }
    case "corporate": {
      const c = content as { organisation?: string };
      return c.organisation?.trim() ? `${c.organisation.trim()} invites you` : "";
    }
  }
}

/**
 * When the headline is blank, derive it from category fields (for example
 * "Aisha & Rohan" from the partner names). Used by the preview and at publish
 * so names typed in the "Who" section always appear on the invitation.
 */
export function withDerivedHeadline<T extends { kind: ContentKind; headline?: string }>(content: T): T {
  if (typeof content.headline === "string" && content.headline.trim()) return content;
  const derived = suggestHeadline(content as unknown as Partial<InvitationContentInput> & { kind: ContentKind });
  return derived ? { ...content, headline: derived } : content;
}

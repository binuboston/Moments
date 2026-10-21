import { CalendarClockIcon, CalendarDaysIcon, ContactRoundIcon, ImageIcon, MapPinIcon, MusicIcon, PaletteIcon, PenLineIcon, UsersRoundIcon, type LucideIcon } from "lucide-react";
import type { InvitationDraft } from "@/features/invitations/types";
import { KIND_FIELDS } from "@/features/invitations/editor/content-form";
import type { Tone } from "@/lib/design/tones";
import type { ContentKind } from "@/lib/validation/content";

/**
 * The editor's steps, in order: the single source for the step bar, the
 * Back / Next flow, completion ticks, where a publish problem sends you, and
 * which step a returning owner lands on.
 */
export const EDITOR_STEPS = ["names", "when", "where", "words", "schedule", "photos", "design", "music", "extras"] as const;
export type EditorStep = (typeof EDITOR_STEPS)[number];

type Content = Record<string, unknown> & { venue?: { name?: string }; contacts?: unknown[]; gifts?: { note?: string; url?: string } };

export interface StepDefinition {
  title: string;
  /** Label in the step bar. */
  short: string;
  description: string;
  icon: LucideIcon;
  tone: Tone;
  /** Optional steps never block publishing and show "Optional" until used. */
  optional: boolean;
  /** Content fields edited here (top-level keys), for error badges and publish links. */
  fields?: string[];
  complete: (draft: InvitationDraft) => boolean;
}

const content = (d: InvitationDraft) => d.content as Content;
const filled = (v: unknown) => typeof v === "string" ? v.trim().length > 0 : v !== undefined && v !== null && v !== "";

export function nameFields(kind: ContentKind): string[] {
  return KIND_FIELDS[kind].map((f) => f.name as string);
}

export const STEP_DEFINITIONS: Record<EditorStep, StepDefinition> = {
  names: {
    title: "Who is it for?",
    short: "Names",
    description: "The names guests will see first.",
    icon: UsersRoundIcon,
    tone: "rose",
    optional: false,
    fields: ["partnerOne", "partnerTwo", "familyOne", "familyTwo", "celebrantName", "age", "years", "parentNames", "babyName", "reveal", "hostNames", "occasion", "organisation", "agenda"],
    complete: (d) => KIND_FIELDS[d.categorySlug as ContentKind].filter((f) => !f.optional).every((f) => filled(content(d)[f.name])),
  },
  when: {
    title: "When is it?",
    short: "Date & time",
    description: "Pick the day and time. Guests see it in your event's time zone.",
    icon: CalendarDaysIcon,
    tone: "amber",
    optional: false,
    fields: ["startsAt", "endsAt", "timezone"],
    complete: (d) => filled(content(d).startsAt),
  },
  where: {
    title: "Where is it?",
    short: "Venue",
    description: "Where to go, and a directions link so nobody gets lost.",
    icon: MapPinIcon,
    tone: "teal",
    optional: false,
    fields: ["venue", "dressCode"],
    complete: (d) => filled(content(d).venue?.name),
  },
  words: {
    title: "Your words",
    short: "Words",
    description: "A headline and a short welcome. We can suggest one from the names.",
    icon: PenLineIcon,
    tone: "violet",
    optional: false,
    fields: ["headline", "subheading", "intro", "hosts", "invocation"],
    complete: (d) => filled(content(d).headline),
  },
  schedule: {
    title: "The schedule",
    short: "Schedule",
    description: "Ceremonies, receptions or a running order. Skip it for a single event.",
    icon: CalendarClockIcon,
    tone: "amber",
    optional: true,
    complete: (d) => d.functions.length > 0,
  },
  photos: {
    title: "Photos",
    short: "Photos",
    description: "A cover photo and a gallery bring the invitation to life.",
    icon: ImageIcon,
    tone: "teal",
    optional: true,
    complete: (d) => d.media.length > 0,
  },
  design: {
    title: "Look & feel",
    short: "Design",
    description: "Colours, typography, gallery style and which sections show.",
    icon: PaletteIcon,
    tone: "violet",
    optional: true,
    complete: (d) => Boolean(d.theme.paletteId || d.theme.fontPairingId || d.theme.gallery),
  },
  music: {
    title: "Music",
    short: "Music",
    description: "A soft soundtrack that starts when guests open the invitation.",
    icon: MusicIcon,
    tone: "blue",
    optional: true,
    complete: (d) => Boolean(d.settings.musicTrack),
  },
  extras: {
    title: "Contacts & extras",
    short: "Extras",
    description: "Who to call, gifts, a closing message and a hashtag.",
    icon: ContactRoundIcon,
    tone: "green",
    optional: true,
    fields: ["contacts", "gifts", "message", "hashtag"],
    complete: (d) => {
      const c = content(d);
      return Boolean(c.contacts?.length || filled(c.gifts?.note) || filled(c.gifts?.url) || filled(c.message) || filled(c.hashtag));
    },
  },
};

/** Where a returning owner starts: the first required step still to do, else the first step. */
export function firstIncompleteStep(draft: InvitationDraft): EditorStep {
  return EDITOR_STEPS.find((s) => !STEP_DEFINITIONS[s].optional && !STEP_DEFINITIONS[s].complete(draft)) ?? "names";
}

/** The step that edits a validation path ("content.venue.mapsUrl", "functions.0.name"), or null for settings. */
export function stepForPath(path: string): EditorStep | null {
  if (path.startsWith("functions")) return "schedule";
  if (!path.startsWith("content.")) return null;
  const key = path.slice("content.".length).split(".")[0];
  return EDITOR_STEPS.find((s) => STEP_DEFINITIONS[s].fields?.includes(key)) ?? "words";
}

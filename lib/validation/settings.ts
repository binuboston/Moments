import { z } from "zod";
import { isoDateTime } from "@/lib/validation/common";

export const rsvpSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  allowGuestCount: z.boolean().default(true),
  maxGuests: z.coerce.number().int().min(1).max(20).default(5),
  askDietary: z.boolean().default(false),
  askContact: z.boolean().default(false),
  deadline: z.union([z.literal(""), isoDateTime]).default(""),
});

export const settingsSchema = z.object({
  rsvp: rsvpSettingsSchema.default({
    enabled: false,
    allowGuestCount: true,
    maxGuests: 5,
    askDietary: false,
    askContact: false,
    deadline: "",
  }),
  showCalendarActions: z.boolean().default(true),
  /** Guests tap Open on a welcome card to reveal the invitation (public page and live demo only). */
  openingCover: z.boolean().default(true),
});

export type InvitationSettings = z.infer<typeof settingsSchema>;

export const defaultSettings: InvitationSettings = settingsSchema.parse({});

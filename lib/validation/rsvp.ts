import { z } from "zod";

export const rsvpSubmissionSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  guestName: z.string().trim().min(1, "Please tell us your name").max(120),
  attendance: z.enum(["yes", "no", "maybe"]),
  guestCount: z.coerce.number().int().min(0).max(20).default(1),
  message: z.string().trim().max(1000).default(""),
  dietaryNotes: z.string().trim().max(500).default(""),
  contact: z.string().trim().max(160).default(""),
  /** Honeypot. Must stay empty. */
  website: z.string().max(0).optional(),
});

export type RsvpSubmission = z.infer<typeof rsvpSubmissionSchema>;
export type RsvpSubmissionInput = z.input<typeof rsvpSubmissionSchema>;

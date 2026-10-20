import { z } from "zod";
import { httpsUrl, isoDateTime, optionalText, requiredText, timezone, uuid } from "@/lib/validation/common";

export const functionSchema = z
  .object({
    id: uuid.optional(),
    name: requiredText(80),
    description: optionalText(600),
    startsAt: isoDateTime,
    endsAt: z.union([z.literal(""), isoDateTime]).default(""),
    timezone,
    venueName: optionalText(160),
    address: optionalText(400),
    mapsUrl: httpsUrl,
    dressCode: optionalText(120),
    sortOrder: z.number().int().min(0).max(100).default(0),
  })
  .refine((f) => !f.endsAt || new Date(f.endsAt) >= new Date(f.startsAt), {
    message: "End time must be after the start time",
    path: ["endsAt"],
  });

export const functionsSchema = z.array(functionSchema).max(12);

export type InvitationFunction = z.infer<typeof functionSchema>;
export type InvitationFunctionInput = z.input<typeof functionSchema>;

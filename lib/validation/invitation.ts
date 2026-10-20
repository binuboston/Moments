import { z } from "zod";
import { CATEGORY_SLUGS } from "@/types/domain";
import { contentSchema, draftContentSchema } from "@/lib/validation/content";
import { functionsSchema } from "@/lib/validation/functions";
import { settingsSchema } from "@/lib/validation/settings";
import { themeSchema } from "@/lib/validation/theme";
import { slugSchema } from "@/lib/utils/slug";

export const createInvitationSchema = z.object({
  categorySlug: z.enum(CATEGORY_SLUGS),
  templateSlug: z.string().trim().min(1).max(60),
});

/** Partial updates from the editor. Content is loosely validated while drafting. */
export const updateInvitationSchema = z
  .object({
    title: z.string().trim().max(140),
    content: draftContentSchema,
    theme: themeSchema,
    settings: settingsSchema,
    functions: functionsSchema,
    templateSlug: z.string().trim().min(1).max(60),
    slug: slugSchema,
  })
  .partial();

export type UpdateInvitationInput = z.input<typeof updateInvitationSchema>;

/** Strict validation applied before an invitation can be published. */
export const publishableSchema = z.object({
  content: contentSchema,
  theme: themeSchema,
  settings: settingsSchema,
  functions: functionsSchema,
});

export const invitationListQuerySchema = z.object({
  status: z.enum(["all", "draft", "published", "unpublished"]).default("all"),
  q: z.string().trim().max(80).default(""),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

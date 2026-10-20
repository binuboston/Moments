import { revalidateTag } from "next/cache";
import { z } from "zod";
import { handle, json, mapDbError, readJson, requireAdmin } from "@/lib/api/respond";
import { CATEGORY_SLUGS } from "@/types/domain";

const createSchema = z.object({
  slug: z.enum(CATEGORY_SLUGS, { message: "Slug must match a content schema defined in the codebase" }),
  name: z.string().trim().min(1).max(60),
  description: z.string().trim().max(300).default(""),
  icon: z.string().trim().max(40).default(""),
  sort_order: z.coerce.number().int().default(100),
});

export const POST = handle(async (request: Request) => {
  const { supabase } = await requireAdmin();
  const body = createSchema.parse(await readJson(request));
  const { data, error } = await supabase
    .from("event_categories")
    .insert({ slug: body.slug, name: body.name, description: body.description || null, icon: body.icon || null, sort_order: body.sort_order })
    .select("id")
    .single();
  if (error) mapDbError(error, "admin.categories.create");
  revalidateTag("categories", "max");
  return json({ id: data.id }, 201);
});

import { z } from "zod";
import { handle, json, mapDbError, readJson, requireUser } from "@/lib/api/respond";
import { timezone } from "@/lib/validation/common";
import { emptyContent } from "@/lib/validation/content";
import { createInvitationSchema, invitationListQuerySchema } from "@/lib/validation/invitation";
import { defaultSettings } from "@/lib/validation/settings";
import { defaultTheme } from "@/lib/validation/theme";
import { nextRoundHourIso } from "@/lib/utils/dates";
import { listOwnedInvitations } from "@/features/invitations/queries";
import { resolveCategory, resolveTemplate, uniqueSlug } from "@/features/invitations/server-actions-helpers";

export const GET = handle(async (request: Request) => {
  const { user, supabase } = await requireUser();
  const url = new URL(request.url);
  const params = invitationListQuerySchema.parse(Object.fromEntries(url.searchParams));
  const result = await listOwnedInvitations(supabase, user.id, params);
  return json(result);
});

const createSchema = createInvitationSchema.extend({ timezone: timezone.optional() });

export const POST = handle(async (request: Request) => {
  const { user, supabase } = await requireUser();
  const body = createSchema.parse(await readJson(request));

  const [category, template] = await Promise.all([resolveCategory(supabase, body.categorySlug), resolveTemplate(supabase, body.templateSlug)]);
  // Premium templates may be drafted on any plan; publishing enforces the entitlement.

  const tz = body.timezone ?? "UTC";
  const slug = await uniqueSlug(supabase, "", category.slug);
  const content = emptyContent(body.categorySlug, nextRoundHourIso(tz), tz);

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      owner_id: user.id,
      template_id: template.id,
      category_id: category.id,
      slug,
      title: "",
      status: "draft",
      content: content as unknown as Record<string, never>,
      theme: { ...defaultTheme } as unknown as Record<string, never>,
      settings: defaultSettings as unknown as Record<string, never>,
    })
    .select("id, slug")
    .single();
  if (error) mapDbError(error, "createInvitation");

  return json({ id: data.id, slug: data.slug }, 201);
});

export type CreateInvitationBody = z.infer<typeof createSchema>;

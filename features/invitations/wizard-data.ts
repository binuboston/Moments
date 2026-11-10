import "server-only";

import type { ComponentProps } from "react";
import type { NewInvitationWizard } from "@/features/invitations/components/new-invitation-wizard";
import { getActiveCategories, getPublishedTemplates } from "@/features/templates/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import { CREATE_FLOW_PARAMS } from "@/lib/routes";
import { uuid } from "@/lib/validation/common";
import type { CategorySlug } from "@/types/domain";

type SearchParams = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Everything the Create flow needs, for every page that shows it (Home and
 * /create): occasions, designs, the plan, and the draft key when coming back
 * from sign-in (`?key`). The wizard reads `?category` and `?template` itself.
 */
export async function getWizardProps(searchParams: SearchParams): Promise<ComponentProps<typeof NewInvitationWizard>> {
  const [categories, templates, profile] = await Promise.all([getActiveCategories(), getPublishedTemplates(), getCurrentProfile()]);
  const key = first(searchParams.key);
  return {
    categories: categories.map((c) => ({ slug: c.slug as CategorySlug, name: c.name, description: c.description, icon: c.icon })),
    templates: templates.map((t) => ({ slug: t.row.slug, key: t.def.key, name: t.def.name, description: t.row.description ?? t.def.description, tier: t.row.tier, categories: t.def.categories, gradient: t.def.previewGradient })),
    plan: profile?.plan ?? "free",
    // Back from sign-up or log-in: the wizard continues with this draft key (see NewInvitationWizard).
    resumeKey: uuid.safeParse(key).success ? key : undefined,
  };
}

/** The Create flow's choice from page search params, as a query string ("" when there is none). */
export function createFlowQuery(searchParams: SearchParams): string {
  const query = new URLSearchParams();
  for (const name of CREATE_FLOW_PARAMS) {
    const value = first(searchParams[name]);
    if (value) query.set(name, value);
  }
  return query.toString();
}

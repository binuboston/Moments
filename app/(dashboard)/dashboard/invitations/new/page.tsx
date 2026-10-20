import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { NewInvitationWizard } from "@/features/invitations/components/new-invitation-wizard";
import { getActiveCategories, getPublishedTemplates } from "@/features/templates/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import type { CategorySlug } from "@/types/domain";

export const metadata: Metadata = { title: "New invitation", robots: { index: false } };

export default async function NewInvitationPage({ searchParams }: PageProps<"/dashboard/invitations/new">) {
  const sp = await searchParams;
  const [categories, templates, profile] = await Promise.all([getActiveCategories(), getPublishedTemplates(), getCurrentProfile()]);
  const preselectedTemplate = typeof sp.template === "string" ? sp.template : undefined;
  const preselectedCategory = typeof sp.category === "string" ? (sp.category as CategorySlug) : undefined;

  return (
    <div className="grid gap-8">
      <PageHeader title="Create an invitation" description="Choose the occasion, pick a design, and we'll set up your draft." />
      <NewInvitationWizard
        categories={categories.map((c) => ({ slug: c.slug as CategorySlug, name: c.name, description: c.description, icon: c.icon }))}
        templates={templates.map((t) => ({ slug: t.row.slug, key: t.def.key, name: t.def.name, description: t.row.description ?? t.def.description, tier: t.row.tier, categories: t.def.categories, gradient: t.def.previewGradient }))}
        plan={profile?.plan ?? "free"}
        preselectedTemplate={preselectedTemplate}
        preselectedCategory={preselectedCategory}
      />
    </div>
  );
}

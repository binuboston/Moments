import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { NewInvitationWizard } from "@/features/invitations/components/new-invitation-wizard";
import { getActiveCategories, getPublishedTemplates } from "@/features/templates/queries";
import { getCurrentProfile } from "@/lib/supabase/server";
import type { CategorySlug } from "@/types/domain";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "New invitation", robots: { index: false } };

export default async function NewInvitationPage({ searchParams }: PageProps<"/invitations/new">) {
  const sp = await searchParams;
  const [categories, templates, profile] = await Promise.all([getActiveCategories(), getPublishedTemplates(), getCurrentProfile()]);
  const preselectedTemplate = typeof sp.template === "string" ? sp.template : undefined;
  const preselectedCategory = typeof sp.category === "string" ? (sp.category as CategorySlug) : undefined;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-8">
      {/* Phones: the Create tab already says where you are; the heading stays for screen readers. */}
      <div className="max-sm:sr-only">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-1 max-sm:hidden">
          <Link href={ROUTES.invitations}>
            <ArrowLeftIcon aria-hidden /> Invitations
          </Link>
        </Button>
        <PageHeader title="Create an invitation" description="Choose the occasion, pick a design, and we'll set up your draft." />
      </div>
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

import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/marketing/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { TemplateCard } from "@/features/templates/components/template-card";
import { getActiveCategories, getPublishedTemplates } from "@/features/templates/queries";
import { cn } from "@/lib/utils/cn";
import { CATEGORY_SLUGS, type CategorySlug } from "@/types/domain";
import { LayoutTemplateIcon } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Templates",
  description: "Browse professionally designed digital invitation templates for weddings, birthdays, baby showers, parties and corporate events.",
  alternates: { canonical: ROUTES.templates },
};

function isCategory(value: string | undefined): value is CategorySlug {
  return Boolean(value) && (CATEGORY_SLUGS as readonly string[]).includes(value as string);
}

export default async function TemplatesPage({ searchParams }: PageProps<"/templates">) {
  const params = await searchParams;
  const rawCategory = Array.isArray(params.category) ? params.category[0] : params.category;
  const rawTier = Array.isArray(params.tier) ? params.tier[0] : params.tier;
  const category = isCategory(rawCategory) ? rawCategory : undefined;
  const tier = rawTier === "free" || rawTier === "premium" ? rawTier : undefined;

  const [templates, categories] = await Promise.all([getPublishedTemplates(), getActiveCategories()]);
  const filtered = templates.filter((t) => (!category || t.def.categories.includes(category)) && (!tier || t.row.tier === tier));

  const buildHref = (next: { category?: string; tier?: string }) => {
    const sp = new URLSearchParams();
    const c = next.category === undefined ? category : next.category;
    const tr = next.tier === undefined ? tier : next.tier;
    if (c) sp.set("category", c);
    if (tr) sp.set("tier", tr);
    const qs = sp.toString();
    return qs ? `${ROUTES.templates}?${qs}` : ROUTES.templates;
  };

  const chip = (active: boolean) =>
    cn(
      "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
      active ? "border-foreground bg-foreground text-background" : "border-border bg-surface text-muted-foreground hover:border-foreground/40 hover:text-foreground",
    );

  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading as="h1" align="left" eyebrow="Template catalogue" title="Find the design for your occasion" description="Live previews rendered with sample content. Every template adapts to your names, dates, photos and colours." />

      <nav aria-label="Filter templates" className="mt-10 flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Link href={buildHref({ category: "" })} className={chip(!category)} aria-current={!category ? "page" : undefined}>
            All occasions
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={buildHref({ category: c.slug })} className={chip(category === c.slug)} aria-current={category === c.slug ? "page" : undefined}>
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          <Link href={buildHref({ tier: "" })} className={chip(!tier)}>
            All
          </Link>
          <Link href={buildHref({ tier: "free" })} className={chip(tier === "free")}>
            Free
          </Link>
          <Link href={buildHref({ tier: "premium" })} className={chip(tier === "premium")}>
            Premium
          </Link>
        </div>
      </nav>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-12"
          icon={LayoutTemplateIcon}
          title="No templates match these filters"
          description="Try another occasion or clear the filters to see the full collection."
          action={
            <Link href={ROUTES.templates} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Clear filters
            </Link>
          }
        />
      ) : (
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <li key={t.row.id}>
              <TemplateCard template={t} category={category} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}

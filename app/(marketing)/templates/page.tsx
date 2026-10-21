import type { Metadata } from "next";
import Link from "next/link";
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
  const filtered = templates.filter(
    (t) => (!category || t.def.categories.includes(category)) && (!tier || t.row.tier === tier),
  );

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
      "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      active ? "bg-foreground text-background" : "bg-fill text-foreground hover:bg-fill-hover",
    );

  return (
    <div className="px-4 pt-2 pb-10 sm:px-6">
      {/* Phones: the filters come first (the heading stays for screen readers). */}
      <header className="max-w-2xl max-sm:sr-only">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Find the design for your occasion</h1>
        <p className="mt-2 text-muted-foreground">Live previews with sample content. Every design adapts to your names, dates, photos and colours.</p>
      </header>

      <nav aria-label="Filter templates" className="flex flex-col gap-3 sm:mt-6">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:-mx-6 sm:px-6">
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
          className="mt-8"
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
        <ul className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5 [&>li]:mb-5 [&>li]:break-inside-avoid">
          {filtered.map((t) => (
            <li key={t.row.id}>
              <TemplateCard template={t} category={category} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

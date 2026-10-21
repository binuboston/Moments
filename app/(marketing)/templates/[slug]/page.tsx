import { ArrowRightIcon, CheckIcon, LockIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { TemplateShowcase } from "@/features/templates/components/template-showcase";
import { getActiveCategories, getPublishedTemplateBySlug, getPublishedTemplates } from "@/features/templates/queries";
import type { CategorySlug } from "@/types/domain";
import { ROUTES, routes } from "@/lib/routes";
import { AppLink } from "@/components/layout/app-link";

export async function generateMetadata({ params }: PageProps<"/templates/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const template = await getPublishedTemplateBySlug(slug);
  if (!template) return { title: "Template not found" };
  return {
    title: `${template.def.name} invitation template`,
    description: template.row.description ?? template.def.description,
    alternates: { canonical: routes.template(slug) },
  };
}

export default async function TemplateDetailPage({ params }: PageProps<"/templates/[slug]">) {
  const { slug } = await params;
  const [template, categories, all] = await Promise.all([getPublishedTemplateBySlug(slug), getActiveCategories(), getPublishedTemplates()]);
  if (!template) notFound();

  const { row, def } = template;
  const supported = categories.filter((c) => def.categories.includes(c.slug as CategorySlug));
  const related = all.filter((t) => t.row.id !== row.id && t.def.categories.some((c) => def.categories.includes(c))).slice(0, 3);
  // No account needed to start: signed-out visitors get a guest session on the way in.
  const startHref = routes.newInvitation({ template: row.slug });

  return (
    <Container className="py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground max-sm:hidden">
        <ol className="flex items-center gap-2">
          <li>
            <Link href={ROUTES.templates} className="hover:text-foreground">
              Templates
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground">
            {def.name}
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-2">
            {row.tier === "premium" ? (
              <Badge variant="dark">
                <LockIcon aria-hidden /> Premium
              </Badge>
            ) : (
              <Badge variant="success">Free</Badge>
            )}
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{def.name}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">{row.description ?? def.description}</p>

          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Works for</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {supported.map((c) => (
                  <Link key={c.id} href={routes.templatesFor(c.slug)} className="rounded-full border border-border px-3 py-1 text-sm hover:border-foreground/40">
                    {c.name}
                  </Link>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Palettes</dt>
              <dd className="mt-2 flex flex-wrap gap-2">
                {def.palettes.map((p) => (
                  <span key={p.id} className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs" title={p.name}>
                    {p.swatch.map((c, i) => (
                      <span key={i} className="size-3 rounded-full ring-1 ring-black/10" style={{ background: c }} aria-hidden />
                    ))}
                    {p.name}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Typography</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{def.fontPairings.map((f) => f.name).join(" · ")}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Sections</dt>
              <dd className="mt-2 text-sm text-muted-foreground capitalize">{def.sections.join(", ")}</dd>
            </div>
          </dl>

          <ul className="mt-8 space-y-2 text-sm">
            {["Responsive on every screen", "Live countdown and add-to-calendar", "Optional RSVP form", "WhatsApp-ready link preview"].map((i) => (
              <li key={i} className="flex gap-2 text-muted-foreground">
                <CheckIcon className="size-4 text-success" aria-hidden /> {i}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <AppLink href={startHref}>
                Use this template <ArrowRightIcon aria-hidden />
              </AppLink>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={routes.demo(row.slug)} target="_blank" data-testid="live-demo">
                View live demo
              </Link>
            </Button>
          </div>
          {row.tier === "premium" ? <p className="mt-3 text-xs text-muted-foreground">Premium templates are available on the Pro plan.</p> : null}
        </div>

        <TemplateShowcase templateKey={def.key} templateName={def.name} tier={row.tier} categories={def.categories} palettes={def.palettes} fontPairings={def.fontPairings} defaults={def.defaults} />
      </div>

      {related.length > 0 ? (
        <section className="mt-24">
          <h2 className="font-display text-2xl font-semibold tracking-tight">You might also like</h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => (
              <li key={t.row.id}>
                <RelatedCard slug={t.row.slug} name={t.def.name} description={t.row.description ?? t.def.description} gradient={t.def.previewGradient} tier={t.row.tier} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}

function RelatedCard({ slug, name, description, gradient, tier }: { slug: string; name: string; description: string; gradient: string; tier: string }) {
  return (
    <Link href={routes.template(slug)} className="group block rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-soft">
      <div className="h-24 rounded-xl" style={{ background: gradient }} aria-hidden />
      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-semibold group-hover:text-primary">{name}</h3>
        <Badge variant={tier === "premium" ? "dark" : "outline"}>{tier === "premium" ? "Premium" : "Free"}</Badge>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}

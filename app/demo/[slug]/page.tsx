import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedTemplateBySlug } from "@/features/templates/queries";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";
import { CATEGORY_SLUGS, type CategorySlug } from "@/types/domain";

export async function generateMetadata({ params }: PageProps<"/demo/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const template = await getPublishedTemplateBySlug(slug);
  return {
    title: template ? `${template.def.name} live demo` : "Template not found",
    robots: { index: false, follow: false },
  };
}

/** Full-screen live demo of a template with sample content and licensed sample photos. */
export default async function TemplateDemoPage({ params, searchParams }: PageProps<"/demo/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const template = await getPublishedTemplateBySlug(slug);
  if (!template) notFound();
  const { def, row } = template;

  const requested = typeof sp.occasion === "string" ? sp.occasion : "";
  const category: CategorySlug = (CATEGORY_SLUGS as readonly string[]).includes(requested) && def.categories.includes(requested as CategorySlug) ? (requested as CategorySlug) : def.categories[0];
  const palette = typeof sp.palette === "string" && def.palettes.some((p) => p.id === sp.palette) ? sp.palette : "";
  const base = sampleView(category, { key: def.key, name: def.name, tier: row.tier });
  const view = { ...base, theme: { ...base.theme, paletteId: palette } };

  return (
    <main className="min-h-screen">
      <div className="fixed top-3 left-3 z-[75] flex items-center gap-2 rounded-full border border-black/10 bg-white/85 py-1.5 pr-1.5 pl-3 text-xs text-neutral-800 shadow-lg backdrop-blur">
        <Link href={`/templates/${row.slug}`} className="inline-flex items-center gap-1 font-medium hover:underline">
          <ArrowLeftIcon className="size-3.5" aria-hidden /> {def.name}
        </Link>
        <span className="text-neutral-500">· Sample</span>
        <Link href={`/signup?next=${encodeURIComponent(`/dashboard/invitations/new?template=${row.slug}`)}`} className="rounded-full bg-neutral-900 px-3 py-1 font-medium text-white hover:bg-neutral-700">
          Use this design
        </Link>
      </div>
      <InvitationRenderer view={view} mode="demo" motion="full" />
      {def.experience === "cinematic" ? (
        <p className="bg-neutral-950 px-6 py-4 text-center text-[11px] text-neutral-400">
          Sample photography from Wikimedia Commons (CC0, CC BY, CC BY-SA); photographers credited in{" "}
          <Link href="/help#sample-photography" className="underline">
            our credits
          </Link>
          . Names and details are fictional.
        </p>
      ) : null}
    </main>
  );
}

import type { MetadataRoute } from "next";
import { getActiveCategories, getPublishedTemplates } from "@/features/templates/queries";
import { siteUrl } from "@/lib/env";
import { ROUTES, routes } from "@/lib/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl(ROUTES.home), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl(ROUTES.about), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: siteUrl(ROUTES.pricing), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl(ROUTES.howItWorks), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl(ROUTES.help), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
  let templates: MetadataRoute.Sitemap = [];
  let occasions: MetadataRoute.Sitemap = [];
  try {
    const [all, categories] = await Promise.all([getPublishedTemplates(), getActiveCategories()]);
    templates = all.map((t) => ({ url: siteUrl(routes.template(t.row.slug)), lastModified: new Date(t.row.updated_at), changeFrequency: "monthly", priority: 0.8 }));
    // Home filtered by occasion (the design catalogue lives on Home).
    occasions = categories.map((c) => ({ url: siteUrl(routes.browse({ category: c.slug })), lastModified: now, changeFrequency: "weekly", priority: 0.9 }));
  } catch {
    // Catalogue unavailable at build time; static pages still ship.
  }
  return [...staticPages, ...occasions, ...templates];
}

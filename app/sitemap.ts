import type { MetadataRoute } from "next";
import { getPublishedTemplates } from "@/features/templates/queries";
import { siteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/templates"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/pricing"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl("/how-it-works"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl("/help"), lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
  let templates: MetadataRoute.Sitemap = [];
  try {
    const all = await getPublishedTemplates();
    templates = all.map((t) => ({ url: siteUrl(`/templates/${t.row.slug}`), lastModified: new Date(t.row.updated_at), changeFrequency: "monthly", priority: 0.8 }));
  } catch {
    // Catalogue unavailable at build time; static pages still ship.
  }
  return [...staticPages, ...templates];
}

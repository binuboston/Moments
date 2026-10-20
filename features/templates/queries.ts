import "server-only";

import { unstable_cache } from "next/cache";
import type { CategorySlug, EventCategory, TemplateRow } from "@/types/domain";
import { createAnonClient } from "@/lib/supabase/server";
import { getTemplate, TEMPLATE_REGISTRY } from "@/features/templates/registry";
import type { TemplateDefinition } from "@/features/templates/types";

export interface CatalogueTemplate {
  row: TemplateRow;
  def: TemplateDefinition;
}

async function fetchPublishedTemplates(): Promise<CatalogueTemplate[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to load templates: ${error.message}`);
  return (data ?? []).flatMap((row) => {
    const def = getTemplate(row.renderer_key);
    if (!def) {
      console.warn(`[templates] renderer_key "${row.renderer_key}" has no registry entry; hiding "${row.slug}"`);
      return [];
    }
    return [{ row, def }];
  });
}

async function fetchCategories(): Promise<EventCategory[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("event_categories").select("*").eq("is_active", true).order("sort_order");
  if (error) throw new Error(`Failed to load categories: ${error.message}`);
  return data ?? [];
}

/** Busts cached catalogue data whenever the set of renderers in code changes (new deploy). */
const REGISTRY_VERSION = Object.keys(TEMPLATE_REGISTRY).sort().join(",");
const REVALIDATE = process.env.NODE_ENV === "development" ? 5 : 3600;

export const getPublishedTemplates = unstable_cache(fetchPublishedTemplates, ["published-templates", REGISTRY_VERSION], {
  tags: ["templates"],
  revalidate: REVALIDATE,
});

export const getActiveCategories = unstable_cache(fetchCategories, ["active-categories"], {
  tags: ["categories"],
  revalidate: REVALIDATE,
});

export async function getPublishedTemplateBySlug(slug: string): Promise<CatalogueTemplate | null> {
  const all = await getPublishedTemplates();
  return all.find((t) => t.row.slug === slug) ?? null;
}

export async function getFeaturedTemplates(limit = 4): Promise<CatalogueTemplate[]> {
  const all = await getPublishedTemplates();
  const featured = all.filter((t) => t.row.is_featured);
  return (featured.length >= limit ? featured : all).slice(0, limit);
}

export function primaryCategory(t: CatalogueTemplate): CategorySlug {
  const first = t.row.category_slugs[0] ?? t.def.categories[0];
  return first as CategorySlug;
}

import "server-only";
import { getPublishedTemplates } from "@/features/templates/queries";
import type { SearchProvider } from "@/features/search/provider";
import { scoreFields } from "@/features/search/score";
import { OCCASION_SYNONYMS } from "@/features/search/synonyms";
import { CATEGORY_LABELS } from "@/lib/categories";
import { routes } from "@/lib/routes";

/** Published designs, by name, description and the occasions they suit. */
export const templatesProvider: SearchProvider = {
  group: "templates",
  label: "Templates",
  async search(query) {
    const all = await getPublishedTemplates();
    return all.flatMap(({ row, def }) => {
      const occasions = def.categories.map((c) => `${CATEGORY_LABELS[c]} ${OCCASION_SYNONYMS[c]}`).join(" ");
      const score = scoreFields(query, [
        { value: def.name, weight: 1 },
        { value: row.description ?? def.description, weight: 0.6 },
        { value: occasions, weight: 0.55 },
      ]);
      if (!score) return [];
      const labels = def.categories.slice(0, 3).map((c) => CATEGORY_LABELS[c]).join(", ");
      return [{ id: `template:${row.slug}`, group: "templates" as const, title: def.name, subtitle: row.tier === "premium" ? `Premium · ${labels}` : labels, href: routes.template(row.slug), icon: "layout" as const, score }];
    });
  },
};

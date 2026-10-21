import "server-only";
import { getActiveCategories } from "@/features/templates/queries";
import type { SearchProvider } from "@/features/search/provider";
import { scoreFields } from "@/features/search/score";
import { OCCASION_SYNONYMS } from "@/features/search/synonyms";
import { routes } from "@/lib/routes";
import type { CategorySlug } from "@/types/domain";

/** Occasions (and the words people use for them), opening the templates for that occasion. */
export const occasionsProvider: SearchProvider = {
  group: "occasions",
  label: "Occasions",
  async search(query) {
    const categories = await getActiveCategories();
    return categories.flatMap((c) => {
      const score = scoreFields(query, [
        { value: c.name, weight: 1 },
        { value: OCCASION_SYNONYMS[c.slug as CategorySlug], weight: 0.8 },
        { value: c.description, weight: 0.4 },
      ]);
      return score ? [{ id: `occasion:${c.slug}`, group: "occasions" as const, title: c.name, subtitle: `Browse ${c.name.toLowerCase()} templates`, href: routes.templatesFor(c.slug), icon: `category:${c.slug}` as const, score }] : [];
    });
  },
};

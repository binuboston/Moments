import type { CategorySlug } from "@/types/domain";

/** Display names for occasions, for places that render without the database (previews, search). */
export const CATEGORY_LABELS: Record<CategorySlug, string> = {
  wedding: "Wedding",
  engagement: "Engagement",
  birthday: "Birthday",
  anniversary: "Anniversary",
  "baby-shower": "Baby shower",
  housewarming: "Housewarming",
  party: "Party",
  corporate: "Corporate",
};

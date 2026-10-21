import type { CategorySlug } from "@/types/domain";

/**
 * Other words people use for each occasion (including Indian names), so
 * "shaadi", "griha pravesh" or "conference" find the right templates.
 */
export const OCCASION_SYNONYMS: Record<CategorySlug, string> = {
  wedding: "marriage shaadi vivah kalyanam nikah reception sangeet mehendi haldi",
  engagement: "ring ceremony roka sagai nischayathartham proposal",
  birthday: "bday birthday party kids first birthday",
  anniversary: "jubilee years together silver golden",
  "baby-shower": "baby godh bharai seemantham valaikaapu naming ceremony",
  housewarming: "griha pravesh gruhapravesam new home house",
  party: "celebration get together dinner cocktail sangeet",
  corporate: "conference launch gala event business office meetup summit awards",
};

import { BabyIcon, BriefcaseIcon, CakeIcon, GemIcon, HeartIcon, HomeIcon, PartyPopperIcon, SparklesIcon, type LucideIcon } from "lucide-react";
import type { CategorySlug } from "@/types/domain";

/**
 * Pastel tones (tile + ink) from the design tokens in app/globals.css.
 * Class names are written out in full so Tailwind can see them.
 */
export const TONES = {
  rose: "bg-tone-rose text-tone-rose-ink",
  violet: "bg-tone-violet text-tone-violet-ink",
  amber: "bg-tone-amber text-tone-amber-ink",
  peach: "bg-tone-peach text-tone-peach-ink",
  teal: "bg-tone-teal text-tone-teal-ink",
  green: "bg-tone-green text-tone-green-ink",
  lime: "bg-tone-lime text-tone-lime-ink",
  blue: "bg-tone-blue text-tone-blue-ink",
  slate: "bg-tone-slate text-tone-slate-ink",
} as const;

export type Tone = keyof typeof TONES;

/** One identity per occasion, used everywhere a category appears in the app. */
export const CATEGORY_STYLE: Record<CategorySlug, { tone: Tone; icon: LucideIcon }> = {
  wedding: { tone: "rose", icon: HeartIcon },
  engagement: { tone: "violet", icon: GemIcon },
  birthday: { tone: "amber", icon: CakeIcon },
  anniversary: { tone: "peach", icon: SparklesIcon },
  "baby-shower": { tone: "teal", icon: BabyIcon },
  housewarming: { tone: "green", icon: HomeIcon },
  party: { tone: "lime", icon: PartyPopperIcon },
  corporate: { tone: "blue", icon: BriefcaseIcon },
};

export function categoryStyle(slug: string): { tone: Tone; icon: LucideIcon } {
  return CATEGORY_STYLE[slug as CategorySlug] ?? { tone: "slate", icon: SparklesIcon };
}

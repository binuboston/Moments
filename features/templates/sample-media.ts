import type { MediaItem } from "@/features/templates/types";
import type { CategorySlug } from "@/types/domain";

/**
 * Sample photography for live demos (public/samples). CC0 photos from
 * Wikimedia Commons, credited in docs/ASSET_CREDITS.md. Real invitations only
 * ever show the owner's uploads.
 */
const photo = (file: string, width: number, height: number, alt: string): MediaItem => ({ id: `sample-${file}`, url: `/samples/${file}.jpg`, width, height, alt: `Sample photo: ${alt}` });

const LOVE: MediaItem[] = [
  photo("love-couple", 1200, 1798, "a bride and groom in traditional Indian wedding dress"),
  photo("love-mehndi", 1200, 798, "hands decorated with bridal mehndi"),
  photo("love-bouquet", 1200, 800, "a bride holding a bouquet of purple flowers"),
  photo("love-sunset", 1200, 801, "a couple embracing at sunset"),
  photo("love-guests", 1200, 738, "guests holding sprays of baby's breath"),
  photo("love-embrace", 1200, 1800, "a bride leaning into her husband"),
];

const CELEBRATION: MediaItem[] = [
  photo("party-balloons", 1200, 1397, "a bunch of colourful party balloons"),
  photo("party-candles", 1200, 722, "a birthday cake with letter candles"),
  photo("party-balloon-walk", 1200, 1800, "a woman holding red balloons"),
  photo("party-cake", 1200, 1095, "a sprinkle-covered layer cake"),
  photo("party-first-cake", 1200, 799, "a birthday cake with a number candle"),
];

const BY_CATEGORY: Partial<Record<CategorySlug, MediaItem[]>> = {
  wedding: LOVE,
  engagement: LOVE,
  anniversary: LOVE,
  birthday: CELEBRATION,
  party: CELEBRATION,
  "baby-shower": CELEBRATION,
};

/** Gallery photos for a live demo of this occasion (empty when none suit it). */
export function sampleGallery(category: CategorySlug): MediaItem[] {
  return BY_CATEGORY[category] ?? [];
}

/** Cover and gallery for a live demo: the first photo is the cover, the rest the gallery. */
export function sampleMedia(category: CategorySlug): { cover: MediaItem | null; gallery: MediaItem[] } {
  const [cover = null, ...gallery] = sampleGallery(category);
  return { cover, gallery };
}

import type { MediaItem } from "@/features/templates/types";

/**
 * Licensed sample photography for previews only. See docs/ASSET_CREDITS.md.
 * Dimensions are the real encoded sizes so layouts reserve space exactly.
 */
export interface SamplePhoto extends MediaItem {
  credit: string;
  licence: string;
  source: string;
}

const photo = (id: string, width: number, height: number, alt: string, credit: string, licence: string, source: string): SamplePhoto => ({
  id: `sample-${id}`,
  url: `/samples/${id}.webp`,
  width,
  height,
  alt,
  credit,
  licence,
  source,
});

export const SAMPLE_PHOTOS = {
  attireHands: photo("attire-hands", 1068, 1600, "Sample photography: a couple holding hands in embroidered wedding attire", "Pablo Heimplatz", "CC0", "https://commons.wikimedia.org/wiki/File:Indian_Wedding_Couple_(Unsplash).jpg"),
  mehndiHandsGold: photo("mehndi-hands-gold", 1600, 1069, "Sample photography: hennaed hands with bangles resting on gold silk", "Maheima Kapur", "CC BY 3.0", "https://commons.wikimedia.org/wiki/File:Bride_And_Groom_After_An_Indian_Wedding_(156684579).jpeg"),
  diya: photo("diya", 1067, 1600, "Sample photography: a lit clay diya among flowers", "Kritzolina", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Diya_at_a_wedding_in_Tamil_Nadu_01.jpg"),
  pujaArrangement: photo("puja-arrangement", 1050, 1400, "Sample photography: marigolds and offerings arranged for a wedding ritual", "Apurv013", "CC0", "https://commons.wikimedia.org/wiki/File:Wedding_Arrangement_(Bengali_Hindu_Wedding_Ceremony).jpg"),
  mehndiDetail: photo("mehndi-detail", 1600, 1067, "Sample photography: detailed bridal mehndi on open hands", "Goutam1962", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:Bridal_mehndi_(henna)_is_a_central_wedding_tradition_02.jpg"),
  mehndiPair: photo("mehndi-pair", 1600, 1065, "Sample photography: two hands covered in intricate mehndi", "DADEVAL", "CC0", "https://commons.wikimedia.org/wiki/File:Mehndi_tatoo_for_wedding_in_India.jpg"),
  mehndiPalm: photo("mehndi-palm", 1067, 1600, "Sample photography: a raised palm with a mandala mehndi design", "Antony Trivet", "CC BY-SA 4.0", "https://commons.wikimedia.org/wiki/File:MEHNDI-93.jpg"),
} as const;

export const SAMPLE_GALLERY: SamplePhoto[] = [
  SAMPLE_PHOTOS.mehndiHandsGold,
  SAMPLE_PHOTOS.diya,
  SAMPLE_PHOTOS.mehndiPalm,
  SAMPLE_PHOTOS.pujaArrangement,
  SAMPLE_PHOTOS.mehndiPair,
  SAMPLE_PHOTOS.mehndiDetail,
];

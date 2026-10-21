import type { CategorySlug } from "@/types/domain";

export type MusicMood = "romantic" | "elegant" | "joyful" | "traditional";

export interface MusicTrack {
  /** Stable id stored in invitation settings; never rename (old invitations keep it). */
  id: string;
  title: string;
  composer: string;
  performer: string;
  mood: MusicMood;
  /** Length of the bundled file, in seconds. */
  duration: number;
  license: "Public domain" | "CC0";
  /** Where the recording and its licence are documented. */
  source: string;
}

export const MOOD_LABEL: Record<MusicMood, string> = {
  romantic: "Romantic",
  elegant: "Calm & elegant",
  joyful: "Joyful",
  traditional: "Traditional",
};

/**
 * Background music guests hear after opening an invitation. Every recording is
 * public domain or CC0 (composition and performance), so invitations can be
 * shared anywhere without licensing or takedown risk. Files live in
 * public/music, trimmed, faded and loudness-matched (see docs/ASSET_CREDITS.md
 * for sources). To add a track, check both the work and the recording are
 * free, add the file and an entry here, and credit it in the docs.
 */
export const MUSIC_LIBRARY: readonly MusicTrack[] = [
  {
    id: "clair-de-lune",
    title: "Clair de Lune",
    composer: "Claude Debussy",
    performer: "Laurens Goedhart, piano",
    mood: "romantic",
    duration: 240,
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Clair_de_lune_(Claude_Debussy)_Suite_bergamasque.ogg",
  },
  {
    id: "nocturne-op-9-no-2",
    title: "Nocturne in E-flat, Op. 9 No. 2",
    composer: "Frédéric Chopin",
    performer: "Peter Johnston, piano",
    mood: "romantic",
    duration: 210,
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Chopin_Nocturne_No._2_in_E_Flat_Major,_Op._9.ogg",
  },
  {
    id: "gymnopedie-no-1",
    title: "Gymnopédie No. 1",
    composer: "Erik Satie",
    performer: "Robin Alciatore, piano",
    mood: "elegant",
    duration: 181,
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg",
  },
  {
    id: "air-on-the-g-string",
    title: "Air on the G String",
    composer: "Johann Sebastian Bach",
    performer: "Air Force Strings, U.S. Air Force Band",
    mood: "elegant",
    duration: 179,
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Air_-_Air_Force_Strings_-_United_States_Air_Force_Band.mp3",
  },
  {
    id: "romance-k525",
    title: "Romance, Eine kleine Nachtmusik",
    composer: "Wolfgang Amadeus Mozart",
    performer: "Musopen archive recording",
    mood: "elegant",
    duration: 210,
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Mozart_K525_Serenade_in_G_Major_2_-_Romance.ogg",
  },
  {
    id: "wedding-march",
    title: "Wedding March",
    composer: "Felix Mendelssohn",
    performer: "Musopen archive recording",
    mood: "joyful",
    duration: 210,
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:A_Midsummer_Night%27s_Dream_Op._61_Wedding_March_(Mendelssohn)_European_Archive.ogg",
  },
  {
    id: "allegro-k525",
    title: "Eine kleine Nachtmusik",
    composer: "Wolfgang Amadeus Mozart",
    performer: "Musopen archive recording",
    mood: "joyful",
    duration: 200,
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Mozart_K525_Serenade_in_G_Major_1_-_Allegro.ogg",
  },
  {
    id: "maple-leaf-rag",
    title: "Maple Leaf Rag",
    composer: "Scott Joplin",
    performer: "Strolling Strings, U.S. Air Force Band",
    mood: "joyful",
    duration: 125,
    license: "Public domain",
    source: "https://commons.wikimedia.org/wiki/File:Maple_Leaf_Rag_-_Strolling_Strings_-_United_States_Air_Force_Band.mp3",
  },
  {
    id: "veena-reethigowlai",
    title: "Sri Nilotpala Nayike (raga Reethigowla)",
    composer: "Muthuswami Dikshitar",
    performer: "L. Ramakrishnan, veena",
    mood: "traditional",
    duration: 210,
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Shri_Nilotpala_Nayike,_rendered_on_the_Veena_by_L_Ramakishnan.ogg",
  },
];

/** Tracks shown first for each occasion (the first one also plays in live demos). */
export const SUGGESTED_TRACKS: Record<CategorySlug, readonly string[]> = {
  wedding: ["veena-reethigowlai", "wedding-march", "clair-de-lune"],
  engagement: ["clair-de-lune", "nocturne-op-9-no-2"],
  anniversary: ["nocturne-op-9-no-2", "air-on-the-g-string"],
  birthday: ["maple-leaf-rag", "allegro-k525"],
  "baby-shower": ["gymnopedie-no-1", "romance-k525"],
  housewarming: ["veena-reethigowlai", "air-on-the-g-string"],
  party: ["maple-leaf-rag", "allegro-k525"],
  corporate: ["air-on-the-g-string", "gymnopedie-no-1"],
};

const BASE = "/music/";

export function musicSrc(track: MusicTrack): string {
  return `${BASE}${track.id}.mp3`;
}

/** The track for a stored id; null for "no music" or an id that is no longer in the library. */
export function findTrack(id: string | null | undefined): MusicTrack | null {
  return (id && MUSIC_LIBRARY.find((t) => t.id === id)) || null;
}

export function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;
}

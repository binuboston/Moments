import type { CategorySlug } from "@/types/domain";
import { contentSchema, type InvitationContent, type InvitationContentInput } from "@/lib/validation/content";
import { defaultSettings } from "@/lib/validation/settings";
import { fromLocalInputValue, zonedParts } from "@/lib/utils/dates";
import type { InvitationView } from "@/features/templates/types";
import { SAMPLE_GALLERY, SAMPLE_PHOTOS } from "@/features/templates/cinematic/sample-photos";
import { gulmoharGarden } from "@/features/templates/cinematic/templates/gulmohar-garden";
import { royalNight } from "@/features/templates/cinematic/templates/royal-night";
import { shubhVivah } from "@/features/templates/cinematic/templates/shubh-vivah";

const CINEMATIC_KEYS = new Set([shubhVivah.key, royalNight.key, gulmoharGarden.key]);

function futureIso(daysAhead: number, hour = 16): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/** A future wall-clock time in a given zone, e.g. 11:40 in Asia/Kolkata. */
function futureAt(daysAhead: number, time: string, tz: string): string {
  const p = zonedParts(new Date(Date.now() + daysAhead * 86_400_000).toISOString(), tz);
  const pad = (n: number) => String(n).padStart(2, "0");
  return fromLocalInputValue(`${p.year}-${pad(p.month)}-${pad(p.day)}T${time}`, tz);
}

const venue = { name: "The Orangery, Kew", address: "Kew Gardens, Richmond TW9 3AB, London", mapsUrl: "https://maps.google.com/?q=The+Orangery+Kew" };

const base = {
  subheading: "",
  intro: "",
  hosts: "",
  message: "We can't wait to celebrate with you.",
  endsAt: "",
  timezone: "Europe/London",
  venue,
  contacts: [{ name: "Priya Sharma", phone: "+44 7700 900123", email: "" }],
  gifts: { note: "", url: "" },
  dressCode: "",
};

export const SAMPLE_CONTENT: Record<CategorySlug, InvitationContentInput> = {
  wedding: {
    kind: "wedding",
    ...base,
    headline: "Aisha & Rohan",
    subheading: "are getting married",
    intro: "Together with their families, Aisha Khan and Rohan Mehta invite you to celebrate the beginning of their forever.",
    hosts: "With the blessings of the Khan and Mehta families",
    startsAt: futureIso(72, 15),
    partnerOne: "Aisha",
    partnerTwo: "Rohan",
    familyOne: "Daughter of Farah & Imran Khan",
    familyTwo: "Son of Meera & Vikram Mehta",
    dressCode: "Festive formal",
    gifts: { note: "Your presence is the greatest gift. Should you wish to give, a contribution to our honeymoon fund would be cherished.", url: "" },
  },
  engagement: {
    kind: "engagement",
    ...base,
    headline: "Sofia & Daniel",
    subheading: "are engaged",
    intro: "Join us for an evening of cocktails and celebration as we toast to the happy couple.",
    startsAt: futureIso(40, 18),
    partnerOne: "Sofia",
    partnerTwo: "Daniel",
  },
  birthday: {
    kind: "birthday",
    ...base,
    headline: "Maya turns five",
    subheading: "A garden party",
    intro: "Bring your dancing shoes and your appetite for cake. There will be bubbles, face painting and a very enthusiastic magician.",
    startsAt: futureIso(21, 14),
    celebrantName: "Maya",
    age: 5,
  },
  anniversary: {
    kind: "anniversary",
    ...base,
    headline: "Grace & Thomas",
    subheading: "Fifty golden years",
    intro: "Half a century of love, laughter and lasting friendship. Please join the family for dinner and dancing.",
    startsAt: futureIso(55, 18),
    partnerOne: "Grace",
    partnerTwo: "Thomas",
    years: 50,
  },
  "baby-shower": {
    kind: "baby-shower",
    ...base,
    headline: "A little one is on the way",
    subheading: "Baby shower for Elena & Marco",
    intro: "Help us shower the parents-to-be with love before their newest adventure begins.",
    startsAt: futureIso(30, 13),
    parentNames: "Elena & Marco",
    babyName: "",
    reveal: "surprise",
  },
  housewarming: {
    kind: "housewarming",
    ...base,
    headline: "We've moved!",
    subheading: "Come see the new place",
    intro: "Drinks, snacks and a grand tour of every cupboard. Children and dogs very welcome.",
    startsAt: futureIso(18, 17),
    hostNames: "Hannah & Ben",
    venue: { name: "Our new home", address: "14 Willow Lane, Bristol BS6 5RT", mapsUrl: "" },
  },
  party: {
    kind: "party",
    ...base,
    headline: "Midsummer Soirée",
    subheading: "An evening under the stars",
    intro: "Live jazz, long tables, lanterns in the trees. Come as the sun goes down and stay until the music stops.",
    startsAt: futureIso(35, 19),
    hostNames: "Olivia & James",
    occasion: "Midsummer Soirée",
    dressCode: "Garden chic",
  },
  corporate: {
    kind: "corporate",
    ...base,
    headline: "Northstar Annual Gala",
    subheading: "Celebrating ten years",
    intro: "An evening of recognition, conversation and celebration as we mark a decade of building together.",
    startsAt: futureIso(48, 18),
    organisation: "Northstar Studios",
    agenda: "18:00 Welcome reception · 19:00 Dinner · 20:30 Awards · 21:30 Dancing",
    dressCode: "Black tie",
    message: "Kindly RSVP by the end of the month.",
  },
};

/**
 * Indian wedding sample used by cinematic templates. Fictional couple; venue is a
 * public landmark used only for illustration, with no invented coordinates.
 */
const kochi = { name: "Bolgatty Palace", address: "Mulavukad, Bolgatty Island", mapsUrl: "" };
const traditional = {
  invocation: "ॐ श्री गणेशाय नमः",
  regionalTitle: "ശുഭ വിവാഹം",
  ceremonyLabel: "Muhurtham",
  city: "Kochi, Kerala",
  timezone: "Asia/Kolkata",
  venue: kochi,
  contacts: [{ name: "Lakshmi Nair", phone: "+91 98470 00000", email: "" }],
};

export const CINEMATIC_SAMPLE_CONTENT: Partial<Record<CategorySlug, InvitationContentInput>> = {
  wedding: {
    ...(SAMPLE_CONTENT.wedding as Extract<InvitationContentInput, { kind: "wedding" }>),
    ...traditional,
    headline: "Together with their families",
    subheading: "request the pleasure of your presence at their wedding",
    intro: "Two families, one promise. We would be honoured to have you with us as we begin our life together.",
    hosts: "With the blessings of the Menon and Nair families",
    partnerOne: "Ananya",
    partnerTwo: "Kiran",
    familyOne: "Daughter of Radha & Suresh Menon",
    familyTwo: "Son of Lakshmi & Gopal Nair",
    startsAt: futureAt(60, "11:40", "Asia/Kolkata"),
    dressCode: "Kerala kasavu or festive traditional",
    message: "Your presence and blessings are our greatest gift.",
    familyMessage: "With love, the families of Ananya and Kiran",
    hashtag: "AnanyaWedsKiran",
    gifts: { note: "", url: "" },
  },
  engagement: {
    ...(SAMPLE_CONTENT.engagement as Extract<InvitationContentInput, { kind: "engagement" }>),
    ...traditional,
    regionalTitle: "നിശ്ചയം",
    ceremonyLabel: "Ceremony",
    headline: "We said yes",
    subheading: "and we'd love you there as we make it official",
    intro: "An evening of music, family and a ring or two.",
    partnerOne: "Meera",
    partnerTwo: "Arjun",
    startsAt: futureAt(30, "18:30", "Asia/Kolkata"),
    message: "Come celebrate the beginning of our forever.",
    familyMessage: "With love, the Iyer and Varma families",
    hashtag: "MeeraAndArjun",
  },
  anniversary: {
    ...(SAMPLE_CONTENT.anniversary as Extract<InvitationContentInput, { kind: "anniversary" }>),
    ...traditional,
    regionalTitle: "",
    ceremonyLabel: "Dinner",
    headline: "Twenty-five years of us",
    subheading: "a silver anniversary celebration",
    partnerOne: "Radha",
    partnerTwo: "Suresh",
    years: 25,
    startsAt: futureAt(45, "19:30", "Asia/Kolkata"),
    message: "Thank you for walking with us all these years.",
    familyMessage: "With love, Ananya and Kiran",
    hashtag: "RadhaSuresh25",
  },
};

export function sampleContent(category: CategorySlug, cinematic = false): InvitationContent {
  const source = (cinematic && CINEMATIC_SAMPLE_CONTENT[category]) || SAMPLE_CONTENT[category];
  return contentSchema.parse(source);
}

export function sampleFunctions(category: CategorySlug) {
  if (category !== "wedding") return [];
  return [
    { name: "Mehendi", description: "An afternoon of henna, music and mithai.", startsAt: futureIso(70, 14), endsAt: "", timezone: "Europe/London", venueName: "Khan family home", address: "", mapsUrl: "", dressCode: "Colourful casual", sortOrder: 0 },
    { name: "Ceremony", description: "", startsAt: futureIso(72, 15), endsAt: "", timezone: "Europe/London", venueName: venue.name, address: venue.address, mapsUrl: venue.mapsUrl, dressCode: "", sortOrder: 1 },
    { name: "Reception", description: "Dinner, speeches and dancing until late.", startsAt: futureIso(72, 19), endsAt: "", timezone: "Europe/London", venueName: venue.name, address: "", mapsUrl: "", dressCode: "", sortOrder: 2 },
  ];
}

function cinematicSampleFunctions(category: CategorySlug) {
  if (category !== "wedding") return [];
  const tz = "Asia/Kolkata";
  return [
    { name: "Mehendi & Sangeet", description: "An evening of henna, music and dance with both families.", startsAt: futureAt(59, "17:00", tz), endsAt: "", timezone: tz, venueName: "Menon Tharavadu", address: "", mapsUrl: "", dressCode: "Festive colours", sortOrder: 0 },
    { name: "Muhurtham", description: "The wedding ceremony.", startsAt: futureAt(60, "11:40", tz), endsAt: "", timezone: tz, venueName: kochi.name, address: kochi.address, mapsUrl: "", dressCode: "Kasavu or traditional", sortOrder: 1 },
    { name: "Wedding Sadya", description: "A traditional feast served on banana leaf.", startsAt: futureAt(60, "13:00", tz), endsAt: "", timezone: tz, venueName: kochi.name, address: "", mapsUrl: "", dressCode: "", sortOrder: 2 },
  ];
}

/** Builds a complete view for catalogue and marketing previews. */
export function sampleView(category: CategorySlug, template: { key: string; name: string; tier: "free" | "premium" }): InvitationView {
  const cinematic = CINEMATIC_KEYS.has(template.key);
  return {
    id: `sample-${template.key}-${category}`,
    slug: `sample-${template.key}-${category}`,
    status: "published",
    category,
    content: sampleContent(category, cinematic),
    functions: cinematic ? cinematicSampleFunctions(category) : sampleFunctions(category),
    media: cinematic ? { cover: SAMPLE_PHOTOS.attireHands, gallery: SAMPLE_GALLERY } : { cover: null, gallery: [] },
    settings: { ...defaultSettings, rsvp: { ...defaultSettings.rsvp, enabled: true } },
    theme: { paletteId: "", fontPairingId: "", sections: {} },
    template,
    publicUrl: "https://mirth.example/e/sample",
    showBranding: false,
  };
}

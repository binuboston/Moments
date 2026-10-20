import type { CategorySlug } from "@/types/domain";
import { contentSchema, type InvitationContent, type InvitationContentInput } from "@/lib/validation/content";
import { defaultSettings } from "@/lib/validation/settings";
import type { InvitationView } from "@/features/templates/types";


/**
 * Sample dates are anchored to UTC midnight so the server render and the
 * browser hydrate produce the same instant regardless of their time zones
 * (a local-time setHours() caused hydration text mismatches).
 */
function futureIso(daysAhead: number, hourUtc = 16): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysAhead, hourUtc, 0, 0)).toISOString();
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

export function sampleContent(category: CategorySlug): InvitationContent {
  return contentSchema.parse(SAMPLE_CONTENT[category]);
}

export function sampleFunctions(category: CategorySlug) {
  if (category !== "wedding") return [];
  return [
    { name: "Mehendi", description: "An afternoon of henna, music and mithai.", startsAt: futureIso(70, 14), endsAt: "", timezone: "Europe/London", venueName: "Khan family home", address: "", mapsUrl: "", dressCode: "Colourful casual", sortOrder: 0 },
    { name: "Ceremony", description: "", startsAt: futureIso(72, 15), endsAt: "", timezone: "Europe/London", venueName: venue.name, address: venue.address, mapsUrl: venue.mapsUrl, dressCode: "", sortOrder: 1 },
    { name: "Reception", description: "Dinner, speeches and dancing until late.", startsAt: futureIso(72, 19), endsAt: "", timezone: "Europe/London", venueName: venue.name, address: "", mapsUrl: "", dressCode: "", sortOrder: 2 },
  ];
}

/** Builds a complete view for catalogue and marketing previews. */
export function sampleView(category: CategorySlug, template: { key: string; name: string; tier: "free" | "premium" }): InvitationView {
  return {
    id: `sample-${template.key}-${category}`,
    slug: `sample-${category}`,
    status: "published",
    category,
    content: sampleContent(category),
    functions: sampleFunctions(category),
    media: { cover: null, gallery: [] },
    settings: { ...defaultSettings, rsvp: { ...defaultSettings.rsvp, enabled: true } },
    theme: { paletteId: "", fontPairingId: "", sections: {} },
    template,
    publicUrl: "https://mirth.example/e/sample",
    showBranding: false,
  };
}

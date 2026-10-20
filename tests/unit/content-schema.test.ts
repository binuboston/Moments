import { describe, expect, it } from "vitest";
import { contentSchema, emptyContent, suggestHeadline } from "@/lib/validation/content";
import { publishableSchema } from "@/lib/validation/invitation";
import { rsvpSubmissionSchema } from "@/lib/validation/rsvp";
import { defaultSettings } from "@/lib/validation/settings";
import { SAMPLE_CONTENT } from "@/features/templates/sample-data";
import { CATEGORY_SLUGS } from "@/types/domain";

describe("content schemas", () => {
  it("accepts sample content for every category", () => {
    for (const slug of CATEGORY_SLUGS) {
      const result = contentSchema.safeParse(SAMPLE_CONTENT[slug]);
      expect(result.success, `${slug}: ${JSON.stringify(result.success ? null : result.error.issues)}`).toBe(true);
    }
  });

  it("rejects a wedding without partner names but accepts a party without hosts", () => {
    const wedding = contentSchema.safeParse({ ...emptyContent("wedding", "2026-06-20T18:30:00+01:00", "Europe/London"), headline: "x" });
    expect(wedding.success).toBe(false);
    const party = contentSchema.safeParse({ ...emptyContent("party", "2026-06-20T18:30:00+01:00", "Europe/London"), headline: "Soirée" });
    expect(party.success).toBe(true);
  });

  it("rejects insecure links and invalid time zones", () => {
    const base = { ...SAMPLE_CONTENT.party, venue: { name: "", address: "", mapsUrl: "http://maps.google.com" } };
    expect(contentSchema.safeParse(base).success).toBe(false);
    expect(contentSchema.safeParse({ ...SAMPLE_CONTENT.party, timezone: "Nowhere/Land" }).success).toBe(false);
  });

  it("suggests headlines from category fields", () => {
    expect(suggestHeadline({ kind: "wedding", partnerOne: "Aisha", partnerTwo: "Rohan" })).toBe("Aisha & Rohan");
    expect(suggestHeadline({ kind: "birthday", celebrantName: "Maya", age: 5 })).toBe("Maya turns 5");
    expect(suggestHeadline({ kind: "corporate", organisation: "Northstar" })).toBe("Northstar invites you");
  });
});

describe("publishable schema", () => {
  it("requires strict content but tolerates empty functions", () => {
    const ok = publishableSchema.safeParse({ content: SAMPLE_CONTENT.birthday, theme: {}, settings: defaultSettings, functions: [] });
    expect(ok.success).toBe(true);
    const bad = publishableSchema.safeParse({ content: { kind: "birthday" }, theme: {}, settings: defaultSettings, functions: [] });
    expect(bad.success).toBe(false);
  });
});

describe("rsvp submission schema", () => {
  it("coerces guest count and rejects honeypot content", () => {
    const parsed = rsvpSubmissionSchema.parse({ slug: "maya-x1y2", guestName: " Priya ", attendance: "yes", guestCount: "2" });
    expect(parsed.guestCount).toBe(2);
    expect(parsed.guestName).toBe("Priya");
    expect(rsvpSubmissionSchema.safeParse({ slug: "maya-x1y2", guestName: "Bot", attendance: "yes", website: "http://spam" }).success).toBe(false);
  });
});

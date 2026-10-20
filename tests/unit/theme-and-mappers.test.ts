import { describe, expect, it } from "vitest";
import { previewContent } from "@/features/invitations/mappers";
import { getTemplate } from "@/features/templates/registry";
import { sampleView } from "@/features/templates/sample-data";
import { resolveTheme } from "@/features/templates/theme";
import { canUseTemplate, showsBranding } from "@/lib/entitlements";
import { titleParts } from "@/features/templates/title";

describe("resolveTheme", () => {
  const def = getTemplate("eternal-grace")!;

  it("falls back to defaults for unknown palette and font ids", () => {
    const view = sampleView("wedding", { key: def.key, name: def.name, tier: "free" });
    const theme = resolveTheme(def, { paletteId: "nope", fontPairingId: "nope", sections: {} }, view);
    expect(theme.palette.id).toBe(def.defaults.paletteId);
    expect(theme.fonts.id).toBe(def.defaults.fontPairingId);
  });

  it("hides sections without content and never hides required ones", () => {
    const view = sampleView("engagement", { key: def.key, name: def.name, tier: "free" });
    view.functions = [];
    view.media = { cover: null, gallery: [] };
    const theme = resolveTheme(def, { paletteId: "", fontPairingId: "", sections: { hero: false, details: false, intro: false } }, view);
    expect(theme.sections.hero).toBe(true);
    expect(theme.sections.details).toBe(true);
    expect(theme.sections.intro).toBe(false);
    expect(theme.sections.schedule).toBe(false);
    expect(theme.sections.gallery).toBe(false);
    expect(theme.sections.rsvp).toBe(true);
  });
});

describe("previewContent", () => {
  it("fills placeholders for missing required fields and drops invalid optional ones", () => {
    const content = previewContent("wedding", { partnerOne: "Aisha", venue: { name: "x", address: "", mapsUrl: "not-a-url" } }, "Europe/London");
    expect(content.kind).toBe("wedding");
    expect(content.headline).toBe("Aisha");
    if (content.kind === "wedding") {
      expect(content.partnerOne).toBe("Aisha");
      expect(content.partnerTwo).toBe("Partner two");
    }
    expect(content.venue.mapsUrl).toBe("");
    expect(content.startsAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("derived headline", () => {
  it("uses partner names when the headline is blank", () => {
    const content = previewContent("wedding", { partnerOne: "Aisha", partnerTwo: "Rohan", headline: "" }, "Europe/London");
    expect(content.headline).toBe("Aisha & Rohan");
  });
  it("keeps a headline the user typed", () => {
    const content = previewContent("wedding", { partnerOne: "Aisha", partnerTwo: "Rohan", headline: "Forever begins" }, "Europe/London");
    expect(content.headline).toBe("Forever begins");
  });
});

describe("titleParts", () => {
  const base = previewContent("wedding", { partnerOne: "Aisha", partnerTwo: "Rohan", headline: "Together with their families" }, "UTC");
  it("shows names as the title and the headline separately for couples", () => {
    expect(titleParts(base)).toEqual({ title: "Aisha & Rohan", headline: "Together with their families" });
  });
  it("hides a headline that only repeats the names", () => {
    expect(titleParts({ ...base, headline: "Aisha and Rohan" }).headline).toBe("");
  });
  it("uses the headline as the title for other events", () => {
    const party = previewContent("party", { headline: "Midsummer Soirée" }, "UTC");
    expect(titleParts(party)).toEqual({ title: "Midsummer Soirée", headline: "" });
  });
});

describe("entitlements", () => {
  it("gates premium templates and branding by plan", () => {
    expect(canUseTemplate("free", "free")).toBe(true);
    expect(canUseTemplate("free", "premium")).toBe(false);
    expect(canUseTemplate("pro", "premium")).toBe(true);
    expect(showsBranding("free")).toBe(true);
    expect(showsBranding("pro")).toBe(false);
  });
});

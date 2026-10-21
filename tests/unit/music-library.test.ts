import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findTrack, MUSIC_LIBRARY, musicSrc, SUGGESTED_TRACKS } from "@/features/music/library";
import { settingsSchema } from "@/lib/validation/settings";
import { CATEGORY_SLUGS } from "@/types/domain";

describe("music library", () => {
  it("has unique ids, a bundled file for every track and only free licences", () => {
    const ids = MUSIC_LIBRARY.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const track of MUSIC_LIBRARY) {
      const file = path.join(process.cwd(), "public", musicSrc(track));
      expect(existsSync(file), `${file} is missing`).toBe(true);
      // Keep guest pages light: about 2.5 MB per track at 96 kbps.
      expect(statSync(file).size).toBeLessThan(3.5 * 1024 * 1024);
      expect(["Public domain", "CC0"]).toContain(track.license);
      expect(track.source).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });

  it("suggests existing tracks for every occasion", () => {
    for (const slug of CATEGORY_SLUGS) {
      expect(SUGGESTED_TRACKS[slug].length).toBeGreaterThan(0);
      for (const id of SUGGESTED_TRACKS[slug]) expect(findTrack(id), id).not.toBeNull();
    }
  });

  it("treats empty and unknown ids as no music", () => {
    expect(findTrack("")).toBeNull();
    expect(findTrack("removed-track")).toBeNull();
    expect(findTrack("clair-de-lune")?.title).toBe("Clair de Lune");
  });
});

describe("settings.musicTrack", () => {
  it("defaults to no music for existing invitations", () => {
    expect(settingsSchema.parse({ openingCover: true }).musicTrack).toBe("");
  });

  it("never invalidates the rest of the settings", () => {
    const parsed = settingsSchema.parse({ openingCover: false, musicTrack: 42 });
    expect(parsed.musicTrack).toBe("");
    expect(parsed.openingCover).toBe(false);
  });
});

describe("sample gallery", () => {
  it("only references bundled photos with real dimensions", async () => {
    const { sampleGallery } = await import("@/features/templates/sample-media");
    for (const slug of CATEGORY_SLUGS) {
      for (const item of sampleGallery(slug)) {
        expect(existsSync(path.join(process.cwd(), "public", item.url)), item.url).toBe(true);
        expect(item.width! > 0 && item.height! > 0).toBe(true);
        expect(item.alt).toMatch(/^Sample photo: /);
      }
    }
    expect(sampleGallery("wedding").length).toBeGreaterThan(2);
  });
});

describe("theme.gallery", () => {
  it("defaults to the template's layout and never invalidates the theme", async () => {
    const { themeSchema } = await import("@/lib/validation/theme");
    expect(themeSchema.parse({}).gallery).toBe("");
    const parsed = themeSchema.parse({ paletteId: "ivory", gallery: "slideshow" });
    expect(parsed.gallery).toBe("");
    expect(parsed.paletteId).toBe("ivory");
  });
});

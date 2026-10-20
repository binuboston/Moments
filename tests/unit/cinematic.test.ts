import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { artDirectionSchema } from "@/features/templates/cinematic/art-direction";
import { QrCode } from "@/features/templates/cinematic/art/qr-code";
import { buildCinematicModel, countdownPhase, dateParts, directionsUrlFor, monogramFor } from "@/features/templates/cinematic/model";
import { SAMPLE_GALLERY, SAMPLE_PHOTOS } from "@/features/templates/cinematic/sample-photos";
import { gulmoharGarden } from "@/features/templates/cinematic/templates/gulmohar-garden";
import { royalNight } from "@/features/templates/cinematic/templates/royal-night";
import { shubhVivah } from "@/features/templates/cinematic/templates/shubh-vivah";
import { CINEMATIC_TEMPLATES, getTemplate } from "@/features/templates/registry";
import { sampleView } from "@/features/templates/sample-data";
import { contrastRatio } from "@/lib/utils/contrast";
import { contentSchema } from "@/lib/validation/content";
import { existsSync } from "node:fs";
import path from "node:path";

const ARTS = [shubhVivah, royalNight, gulmoharGarden];

describe("art directions", () => {
  it.each(ARTS.map((a) => [a.key, a] as const))("%s validates and is registered as cinematic", (_key, art) => {
    expect(artDirectionSchema.safeParse(art).success).toBe(true);
    const def = getTemplate(art.key);
    expect(def?.experience).toBe("cinematic");
    expect(def?.sections).toContain("opening");
  });

  it("rejects a config whose default palette does not exist", () => {
    const broken = { ...shubhVivah, defaults: { ...shubhVivah.defaults, paletteId: "missing" } };
    expect(artDirectionSchema.safeParse(broken).success).toBe(false);
  });

  it("every palette meets WCAG AA for text roles", () => {
    const failures: string[] = [];
    for (const art of ARTS) {
      for (const p of art.palettes) {
        const checks: [string, string, string][] = [
          ["text/bg", p.text, p.bg],
          ["muted/bg", p.muted, p.bg],
          ["accentInk/bg", p.accentInk, p.bg],
          ["accentContrast/accent", p.accentContrast, p.accent],
          ["contrastText/contrastBg", p.contrastText, p.contrastBg],
          ["contrastMuted/contrastBg", p.contrastMuted, p.contrastBg],
          ["contrastAccentInk/contrastBg", p.contrastAccentInk, p.contrastBg],
        ];
        for (const [label, fg, bg] of checks) {
          const ratio = contrastRatio(fg, bg);
          if (ratio < 4.5) failures.push(`${art.key}/${p.id} ${label} ${ratio.toFixed(2)}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("all three are exported in the registry list", () => {
    expect(CINEMATIC_TEMPLATES.map((t) => t.key).sort()).toEqual(["gulmohar-garden", "royal-night", "shubh-vivah"]);
  });
});

describe("countdown phase (honest past states)", () => {
  const start = "2026-10-19T11:40:00+05:30"; // reference wedding: 19 Oct 2026, 11:40 AM IST
  const t = (iso: string) => new Date(iso).getTime();

  it("counts down before the muhurtham", () => {
    expect(countdownPhase(start, "", t("2026-10-19T11:39:59+05:30"))).toBe("upcoming");
  });
  it("is live from the start until 12 hours later when no end time is set", () => {
    expect(countdownPhase(start, "", t("2026-10-19T11:40:00+05:30"))).toBe("live");
    expect(countdownPhase(start, "", t("2026-10-19T23:39:00+05:30"))).toBe("live");
    expect(countdownPhase(start, "", t("2026-10-19T23:41:00+05:30"))).toBe("past");
  });
  it("uses the explicit end time when present", () => {
    expect(countdownPhase(start, "2026-10-19T14:00:00+05:30", t("2026-10-19T14:30:00+05:30"))).toBe("past");
  });
  it("treats the reference date as past today (20 Oct 2026)", () => {
    expect(countdownPhase(start, "", t("2026-10-20T10:00:00+05:30"))).toBe("past");
  });
});

describe("model helpers", () => {
  it("computes calendar parts in the event's own zone", () => {
    // 19 Oct 2026 01:00 IST is still 18 Oct in UTC; the calendar must say 19.
    const p = dateParts("2026-10-19T01:00:00+05:30", "Asia/Kolkata");
    expect(p).toMatchObject({ day: 19, month: 10, year: 2026, weekday: "Monday", monthName: "October", daysInMonth: 31, firstWeekday: 4 });
  });

  it("never invents a location: owner link first, else an address search, else nothing", () => {
    expect(directionsUrlFor({ name: "X", address: "Y", mapsUrl: "https://maps.app.goo.gl/abc" }, "Kochi")).toBe("https://maps.app.goo.gl/abc");
    expect(directionsUrlFor({ name: "CR Auditorium", address: "Eachur", mapsUrl: "" }, "Kannur")).toBe("https://www.google.com/maps/search/?api=1&query=CR%20Auditorium%2C%20Eachur%2C%20Kannur");
    expect(directionsUrlFor({ name: "", address: "", mapsUrl: "" }, "")).toBe("");
  });

  it("builds monograms from couple names", () => {
    expect(monogramFor("Ananya & Kiran")).toBe("AK");
    expect(monogramFor("Maya turns five")).toBe("MT");
  });

  it("builds a cinematic model from the sample wedding", () => {
    const view = sampleView("wedding", { key: "shubh-vivah", name: "Shubh Vivah", tier: "premium" });
    const m = buildCinematicModel(view);
    expect(m.title).toBe("Ananya & Kiran");
    expect(m.invocation).toBe("ॐ श्री गणेशाय नमः");
    expect(m.regionalTitle).toBe("ശുഭ വിവാഹം");
    expect(m.ceremonyLabel).toBe("Muhurtham");
    expect(m.timeLabel).toMatch(/^11:40 AM (IST|GMT\+5:30)$/);
    expect(m.hashtag).toBe("AnanyaWedsKiran");
    expect(m.gallery.length).toBe(SAMPLE_GALLERY.length);
    expect(m.eager).toBe(false);
  });
});

describe("content additions", () => {
  it("old rows without the new fields still parse with empty defaults", () => {
    const old = { kind: "party", headline: "Soirée", startsAt: "2030-06-20T18:00:00+01:00", timezone: "Europe/London" };
    const parsed = contentSchema.parse(old);
    expect(parsed).toMatchObject({ invocation: "", regionalTitle: "", ceremonyLabel: "", city: "", familyMessage: "", hashtag: "" });
  });

  it("normalises and validates hashtags in any script", () => {
    const base = { kind: "party", headline: "x", startsAt: "2030-06-20T18:00:00+01:00", timezone: "UTC" };
    expect(contentSchema.parse({ ...base, hashtag: "#AnanyaWedsKiran" }).hashtag).toBe("AnanyaWedsKiran");
    expect(contentSchema.safeParse({ ...base, hashtag: "ശുഭവിവാഹം_2026" }).success).toBe(true);
    expect(contentSchema.safeParse({ ...base, hashtag: "two words" }).success).toBe(false);
  });
});

describe("QR code", () => {
  it("renders an accessible SVG for a maps link", () => {
    const html = renderToStaticMarkup(createElement(QrCode, { value: "https://www.google.com/maps/search/?api=1&query=Kochi", label: "Directions QR" }));
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Directions QR"');
    expect(html).toMatch(/<path d="M\d/);
  });
});

describe("sample photography", () => {
  it("every sample file exists on disk with recorded dimensions and a licence", () => {
    for (const photo of Object.values(SAMPLE_PHOTOS)) {
      expect(existsSync(path.join(process.cwd(), "public", photo.url)), photo.url).toBe(true);
      expect(photo.width && photo.height).toBeTruthy();
      expect(photo.licence).toMatch(/^CC/);
      expect(photo.alt.startsWith("Sample photography")).toBe(true);
    }
  });
});

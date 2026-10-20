import { describe, expect, it } from "vitest";
import { generateSlug, isValidSlug, RESERVED_SLUGS, slugify, slugSchema } from "@/lib/utils/slug";

describe("slugify", () => {
  it("lowercases, strips diacritics and collapses separators", () => {
    expect(slugify("Aisha & Rohan's Wedding!")).toBe("aisha-and-rohan-s-wedding");
    expect(slugify("Ünïcödé Café")).toBe("unicode-cafe");
    expect(slugify("   multiple   spaces --- here ")).toBe("multiple-spaces-here");
  });
  it("returns empty for symbols only", () => {
    expect(slugify("!!!")).toBe("");
  });
  it("respects max length without trailing hyphen", () => {
    expect(slugify("a very long headline that keeps going and going", 12)).toBe("a-very-long");
  });
});

describe("generateSlug", () => {
  it("appends a 4 character suffix and stays within limits", () => {
    const slug = generateSlug("Aisha & Rohan", "invitation", () => 0.5);
    expect(slug).toMatch(/^aisha-and-rohan-[a-z0-9]{4}$/);
    expect(isValidSlug(slug)).toBe(true);
  });
  it("uses the fallback when the headline is empty", () => {
    expect(generateSlug("", "wedding", () => 0.1)).toMatch(/^wedding-[a-z0-9]{4}$/);
  });
  it("never exceeds 60 characters", () => {
    const slug = generateSlug("x".repeat(200));
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(isValidSlug(slug)).toBe(true);
  });
});

describe("slugSchema", () => {
  it("rejects reserved words, uppercase and bad characters", () => {
    for (const reserved of RESERVED_SLUGS) expect(slugSchema.safeParse(reserved).success).toBe(false);
    expect(slugSchema.safeParse("Has Space").success).toBe(false);
    expect(slugSchema.safeParse("-leading").success).toBe(false);
    expect(slugSchema.safeParse("double--hyphen").success).toBe(false);
    expect(slugSchema.safeParse("ab").success).toBe(false);
  });
  it("normalises case and trims", () => {
    expect(slugSchema.parse("  My-Event-2026 ")).toBe("my-event-2026");
  });
});

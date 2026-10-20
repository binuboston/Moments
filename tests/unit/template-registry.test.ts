import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getTemplate, listTemplates, TEMPLATE_REGISTRY } from "@/features/templates/registry";
import { FONT_FAMILIES } from "@/features/templates/fonts";
import { CATEGORY_SLUGS, REQUIRED_SECTIONS, SECTION_KEYS } from "@/types/domain";

describe("template registry integrity", () => {
  it("every template seeded in the database has a renderer", () => {
    const dir = path.join(process.cwd(), "supabase/migrations");
    const sql = readdirSync(dir)
      .filter((f) => f.endsWith(".sql"))
      .map((f) => readFileSync(path.join(dir, f), "utf8"))
      .join("\n");
    const keys = [...sql.matchAll(/\('([a-z0-9-]+)', '([a-z0-9-]+)', '[^']+',/g)].map((m) => m[2]);
    expect(keys.length).toBeGreaterThanOrEqual(9);
    for (const key of ["shubh-vivah", "royal-night", "gulmohar-garden"]) expect(keys).toContain(key);
    for (const key of keys) expect(getTemplate(key), `missing renderer for ${key}`).toBeDefined();
  });

  it("definitions are internally consistent", () => {
    for (const def of listTemplates()) {
      expect(TEMPLATE_REGISTRY[def.key]).toBe(def);
      expect(def.categories.length).toBeGreaterThan(0);
      for (const c of def.categories) expect(CATEGORY_SLUGS).toContain(c);
      for (const s of def.sections) expect(SECTION_KEYS).toContain(s);
      for (const s of REQUIRED_SECTIONS) expect(def.sections).toContain(s);
      for (const s of def.defaultSections) expect(def.sections).toContain(s);
      expect(def.palettes.some((p) => p.id === def.defaults.paletteId)).toBe(true);
      expect(def.fontPairings.some((f) => f.id === def.defaults.fontPairingId)).toBe(true);
      for (const f of def.fontPairings) {
        expect(FONT_FAMILIES[f.display]).toBeDefined();
        expect(FONT_FAMILIES[f.body]).toBeDefined();
      }
      const ids = def.palettes.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

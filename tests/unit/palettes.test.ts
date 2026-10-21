import { describe, expect, it } from "vitest";
import { listTemplates } from "@/features/templates/registry";
import { DAISY_PALETTES } from "@/features/templates/palettes/daisy.generated";

const channel = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const RECIPES_WITH_STRICT_ACCENT = new Set(["kalyanam", "monochrome", "balloon-bash", "summit"]);

describe("palette contrast (WCAG AA)", () => {
  for (const def of listTemplates()) {
    it(`${def.key}: every palette is readable`, () => {
      for (const p of def.palettes) {
        const v = p.vars;
        const where = `${def.key}/${p.id}`;
        expect(contrast(v.text, v.bg), `${where} text`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(v.muted, v.bg), `${where} muted`).toBeGreaterThanOrEqual(4.5);
        expect(contrast(v.accentContrast, v.accent), `${where} button text`).toBeGreaterThanOrEqual(4.5);
        // Accent is used for small labels: AA (4.5) for new designs and daisyUI palettes; at least 3:1 for the originals.
        const strict = RECIPES_WITH_STRICT_ACCENT.has(def.key) || p.id.startsWith("daisy-");
        expect(contrast(v.accent, v.bg), `${where} accent`).toBeGreaterThanOrEqual(strict ? 4.5 : 3);
      }
    });
  }

  it("daisyUI palettes are generated and well formed", () => {
    for (const [name, p] of Object.entries(DAISY_PALETTES)) {
      expect(p.id).toBe(`daisy-${name}`);
      for (const c of [...Object.values(p.vars), ...p.swatch]) expect(c).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

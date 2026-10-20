import { SECTION_KEYS, type SectionKey } from "@/types/domain";
import type { Palette, TemplateDefinition } from "@/features/templates/types";
import { artDirectionSchema, BLOCK_SECTION, type ArtDirection, type ArtDirectionInput, type CinematicPalette } from "@/features/templates/cinematic/art-direction";
import { CinematicInvitation } from "@/features/templates/cinematic/cinematic-invitation";

function toPalette(p: CinematicPalette): Palette {
  return {
    id: p.id,
    name: p.name,
    vars: { bg: p.bg, surface: p.surface, text: p.text, muted: p.muted, accent: p.accent, accentContrast: p.accentContrast, border: p.border },
    swatch: [p.bg, p.accent, p.contrastBg],
    extra: { accentInk: p.accentInk, contrastAccentInk: p.contrastAccentInk, contrastBg: p.contrastBg, contrastText: p.contrastText, contrastMuted: p.contrastMuted, bloom: p.bloom, leaf: p.leaf },
  };
}

/** Section toggles a cinematic template exposes in the editor, derived from its blocks. */
function sectionsFor(art: ArtDirection): SectionKey[] {
  const used = new Set<SectionKey>(["opening", "hero", "details", "message"]);
  for (const block of art.blocks) {
    const key = BLOCK_SECTION[block];
    if (key) used.add(key);
  }
  return SECTION_KEYS.filter((k) => used.has(k));
}

/**
 * Turns a validated art direction into a registry entry. Validation runs at
 * module load, so a broken config fails tests and the build, not production.
 */
export function defineCinematicTemplate(input: ArtDirectionInput): TemplateDefinition & { art: ArtDirection } {
  const art = artDirectionSchema.parse(input);
  const sections = sectionsFor(art);
  const Component: TemplateDefinition["component"] = (props) => <CinematicInvitation {...props} art={art} />;
  Component.displayName = `Cinematic(${art.key})`;
  return {
    key: art.key,
    name: art.name,
    description: art.description,
    categories: art.categories,
    tier: art.tier,
    sections,
    defaultSections: sections.filter((s) => !art.defaultHidden.includes(s)),
    palettes: art.palettes.map(toPalette),
    fontPairings: art.fonts,
    defaults: art.defaults,
    experience: "cinematic",
    previewGradient: art.previewGradient,
    component: Component,
    art,
  };
}

import type { CategorySlug } from "@/types/domain";
import { botanicalNoir } from "@/features/templates/designs/botanical-noir";
import { confettiPop } from "@/features/templates/designs/confetti-pop";
import { eternalGrace } from "@/features/templates/designs/eternal-grace";
import { goldenGala } from "@/features/templates/designs/golden-gala";
import { modernMinimal } from "@/features/templates/designs/modern-minimal";
import { softPastel } from "@/features/templates/designs/soft-pastel";
import type { TemplateDefinition } from "@/features/templates/types";
import { defineCinematicTemplate } from "@/features/templates/cinematic/define";
import { gulmoharGarden } from "@/features/templates/cinematic/templates/gulmohar-garden";
import { royalNight } from "@/features/templates/cinematic/templates/royal-night";
import { shubhVivah } from "@/features/templates/cinematic/templates/shubh-vivah";

/** Cinematic templates are art-direction configs over a shared engine. */
export const CINEMATIC_TEMPLATES = [shubhVivah, royalNight, gulmoharGarden].map(defineCinematicTemplate);

/**
 * Explicit mapping between approved renderer keys and their components.
 * Only keys listed here can ever be rendered; database rows reference them by
 * `renderer_key`. Nothing user-supplied is ever executed as a template.
 */
export const TEMPLATE_REGISTRY: Readonly<Record<string, TemplateDefinition>> = Object.freeze({
  ...Object.fromEntries(CINEMATIC_TEMPLATES.map((t) => [t.key, t])),
  [eternalGrace.key]: eternalGrace,
  [botanicalNoir.key]: botanicalNoir,
  [modernMinimal.key]: modernMinimal,
  [confettiPop.key]: confettiPop,
  [goldenGala.key]: goldenGala,
  [softPastel.key]: softPastel,
});

export const FALLBACK_TEMPLATE_KEY = modernMinimal.key;

export function getTemplate(key: string): TemplateDefinition | undefined {
  return TEMPLATE_REGISTRY[key];
}

export function getTemplateOrFallback(key: string): TemplateDefinition {
  return TEMPLATE_REGISTRY[key] ?? TEMPLATE_REGISTRY[FALLBACK_TEMPLATE_KEY];
}

export function listTemplates(): TemplateDefinition[] {
  return Object.values(TEMPLATE_REGISTRY);
}

export function templatesForCategory(category: CategorySlug): TemplateDefinition[] {
  return listTemplates().filter((t) => t.categories.includes(category));
}

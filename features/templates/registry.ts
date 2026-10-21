import type { CategorySlug } from "@/types/domain";
import { botanicalNoir } from "@/features/templates/designs/botanical-noir";
import { balloonBash } from "@/features/templates/designs/balloon-bash";
import { confettiPop } from "@/features/templates/designs/confetti-pop";
import { eternalGrace } from "@/features/templates/designs/eternal-grace";
import { goldenGala } from "@/features/templates/designs/golden-gala";
import { kalyanam } from "@/features/templates/designs/kalyanam";
import { modernMinimal } from "@/features/templates/designs/modern-minimal";
import { monochrome } from "@/features/templates/designs/monochrome";
import { softPastel } from "@/features/templates/designs/soft-pastel";
import { summit } from "@/features/templates/designs/summit";
import type { TemplateDefinition } from "@/features/templates/types";

/**
 * Explicit mapping between approved renderer keys and their components.
 * Only keys listed here can ever be rendered; database rows reference them by
 * `renderer_key`. Nothing user-supplied is ever executed as a template.
 */
export const TEMPLATE_REGISTRY: Readonly<Record<string, TemplateDefinition>> = Object.freeze({
  [eternalGrace.key]: eternalGrace,
  [botanicalNoir.key]: botanicalNoir,
  [modernMinimal.key]: modernMinimal,
  [confettiPop.key]: confettiPop,
  [goldenGala.key]: goldenGala,
  [softPastel.key]: softPastel,
  [kalyanam.key]: kalyanam,
  [monochrome.key]: monochrome,
  [balloonBash.key]: balloonBash,
  [summit.key]: summit,
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

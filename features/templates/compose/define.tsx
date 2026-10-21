import { ComposedTemplate } from "@/features/templates/compose/composed-template";
import type { TemplateRecipe } from "@/features/templates/compose/recipe";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";

/** A template definition whose page is built from a recipe (see compose/recipe.ts). */
export function defineTemplate({ recipe, ...definition }: Omit<TemplateDefinition, "component"> & { recipe: TemplateRecipe }): TemplateDefinition {
  function Template(props: TemplateProps) {
    return <ComposedTemplate recipe={recipe} {...props} />;
  }
  Template.displayName = `Template(${definition.key})`;
  return { ...definition, component: Template };
}

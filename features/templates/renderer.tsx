import { cn } from "@/lib/utils/cn";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { resolveTheme, themeCssVars } from "@/features/templates/theme";
import type { InvitationView, RenderMode } from "@/features/templates/types";

interface InvitationRendererProps {
  view: InvitationView;
  mode: RenderMode;
  className?: string;
}

/**
 * The single rendering path for invitations. The editor preview, catalogue
 * previews and the public page all go through here so they never diverge.
 * Isomorphic: no server-only APIs, so the editor can re-render it live.
 */
export function InvitationRenderer({ view, mode, className }: InvitationRendererProps) {
  const def = getTemplateOrFallback(view.template.key);
  const theme = resolveTheme(def, view.theme, view);
  const Template = def.component;
  const palette = theme.palette;

  // Secondary accent colours for playful templates; derived so palettes stay small.
  const extraVars = {
    "--inv-c2": palette.swatch[2],
    "--inv-c3": palette.swatch[1],
  } as React.CSSProperties;

  return (
    <div
      className={cn("invitation-root min-h-full w-full", className)}
      style={{ ...themeCssVars(theme), ...extraVars }}
      data-template={def.key}
      data-mode={mode}
    >
      <Template view={view} theme={theme} mode={mode} />
    </div>
  );
}

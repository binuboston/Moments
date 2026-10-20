import { cn } from "@/lib/utils/cn";
import { formatEventDate } from "@/lib/utils/dates";
import { googleCalendarUrl } from "@/lib/utils/share";
import { kindDetails, monogram, shareData } from "@/features/templates/designs/shared";
import { InvitationExperience } from "@/features/templates/motion/invitation-experience";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { resolveTheme, themeCssVars } from "@/features/templates/theme";
import { titleParts } from "@/features/templates/title";
import type { InvitationView, RenderMode, ResolvedTheme } from "@/features/templates/types";

interface InvitationRendererProps {
  view: InvitationView;
  mode: RenderMode;
  className?: string;
}

/**
 * The single rendering path for invitations. The editor preview, catalogue
 * previews and the public page all go through here so they never diverge.
 * Isomorphic: no server-only APIs, so the editor can re-render it live.
 *
 * Full-page modes (public, demo) add the guest experience: opening envelope,
 * smooth scrolling, motion and quick actions. Previews render statically.
 */
export function InvitationRenderer({ view, mode, className }: InvitationRendererProps) {
  const def = getTemplateOrFallback(view.template.key);
  const theme = resolveTheme(def, view.theme, view);
  const Template = def.component;
  const palette = theme.palette;
  const body = <Template view={view} theme={theme} mode={mode} />;

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
      {mode === "public" || mode === "demo" ? (
        <InvitationExperience cover={view.settings.openingCover ? coverData(view) : null} dock={dockData(view, theme)} particles={def.particles ?? "petals"}>
          {body}
        </InvitationExperience>
      ) : (
        body
      )}
    </div>
  );
}

function coverData(view: InvitationView) {
  const { content } = view;
  return {
    monogram: monogram(view),
    eyebrow: kindDetails(view).eyebrow,
    title: titleParts(content).title,
    date: formatEventDate(content.startsAt, content.timezone),
    invocation: content.invocation,
  };
}

function dockData(view: InvitationView, theme: ResolvedTheme) {
  const { content } = view;
  const place = [content.venue.name, content.venue.address].filter(Boolean).join(", ");
  const share = shareData(view);
  return {
    directionsUrl: content.venue.mapsUrl || (place ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}` : ""),
    calendarUrl: view.settings.showCalendarActions
      ? googleCalendarUrl({ title: share.title, startIso: content.startsAt, endIso: content.endsAt || undefined, details: content.intro || undefined, location: place || undefined })
      : "",
    rsvpTarget: view.settings.rsvp.enabled && theme.sections.rsvp ? "rsvp" : "",
    share,
  };
}

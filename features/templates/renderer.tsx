import { cn } from "@/lib/utils/cn";
import { formatEventDate } from "@/lib/utils/dates";
import { googleCalendarUrl } from "@/lib/utils/share";
import { findTrack, musicSrc } from "@/features/music/library";
import { shareData } from "@/features/templates/designs/shared";
import { InvitationExperience } from "@/features/templates/motion/invitation-experience";
import type { CoverData } from "@/features/templates/motion/opening-cover";
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
 * Full-page modes (public, demo) add the guest experience: opening card,
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
    // The palette's darkest tone, for deep washes such as the opening backdrop.
    "--inv-deep": luminance(palette.vars.bg) < luminance(palette.vars.text) ? palette.vars.bg : palette.vars.text,
  } as React.CSSProperties;

  return (
    <div
      className={cn("invitation-root min-h-full w-full", className)}
      style={{ ...themeCssVars(theme), ...extraVars }}
      data-template={def.key}
      data-mode={mode}
    >
      {mode === "public" || mode === "demo" ? (
        <InvitationExperience cover={view.settings.openingCover ? coverData(view) : null} dock={dockData(view, theme)} music={musicData(view)} particles={def.particles ?? "petals"} motion={def.motion ?? "gentle"}>
          {body}
        </InvitationExperience>
      ) : (
        body
      )}
    </div>
  );
}

function coverData(view: InvitationView): CoverData {
  const { content } = view;
  const couple = "partnerOne" in content && "partnerTwo" in content && content.partnerOne && content.partnerTwo;
  return {
    names: couple ? [content.partnerOne, content.partnerTwo] : [titleParts(content).title],
    date: formatEventDate(content.startsAt, content.timezone),
    invocation: content.invocation,
    icon: ["wedding", "engagement", "anniversary", "baby-shower"].includes(content.kind) ? "heart" : "sparkle",
  };
}

function musicData(view: InvitationView) {
  const track = findTrack(view.settings.musicTrack);
  return track ? { src: musicSrc(track), title: track.title, credit: `${track.composer} · ${track.performer}` } : null;
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

/** Relative luminance of a #rgb/#rrggbb colour (0 black to 1 white); 0.5 for anything else. */
function luminance(color: string): number {
  const hex = color.trim().replace("#", "");
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return 0.5;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

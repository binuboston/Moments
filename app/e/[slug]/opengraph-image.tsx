import { ImageResponse } from "next/og";
import { getPublishedInvitationView } from "@/features/invitations/queries";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { formatEventDate, formatEventTime } from "@/lib/utils/dates";
import { titleParts } from "@/features/templates/title";

export const alt = "Event invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = await getPublishedInvitationView(slug);

  if (!view) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf7f2", color: "#1c1917", fontSize: 48, fontFamily: "Georgia, serif" }}>
          Invitation not available
        </div>
      ),
      size,
    );
  }

  const def = getTemplateOrFallback(view.template.key);
  const palette = def.palettes.find((p) => p.id === view.theme.paletteId) ?? def.palettes[0];
  const v = palette.vars;
  const { content } = view;
  const date = formatEventDate(content.startsAt, content.timezone);
  const time = formatEventTime(content.startsAt, content.timezone);
  const parts = titleParts(content);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: v.bg,
          color: v.text,
          fontFamily: "Georgia, serif",
          border: `18px solid ${v.bg}`,
          boxShadow: `inset 0 0 0 2px ${v.border}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: v.accent, fontFamily: "sans-serif" }}>
          <span>You're invited</span>
          <span style={{ color: v.muted }}>{view.template.name}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {parts.headline ? <div style={{ fontSize: 30, color: v.muted, fontFamily: "sans-serif" }}>{parts.headline}</div> : null}
          <div style={{ fontSize: parts.title.length > 24 ? 64 : 84, lineHeight: 1.05, fontWeight: 600 }}>{parts.title}</div>
          {content.subheading ? <div style={{ fontSize: 34, color: v.muted, fontStyle: "italic" }}>{content.subheading}</div> : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: "sans-serif" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 28 }}>
            <span>{date}</span>
            <span style={{ color: v.muted, fontSize: 24 }}>{content.venue.name ? `${time} · ${content.venue.name}` : time}</span>
          </div>
          <div style={{ width: 120, height: 4, background: v.accent }} />
        </div>
      </div>
    ),
    size,
  );
}

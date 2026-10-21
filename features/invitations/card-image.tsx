import "server-only";
import { ImageResponse } from "next/og";
import { kindDetails } from "@/features/templates/designs/shared";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { titleParts } from "@/features/templates/title";
import type { CardStyle, InvitationView } from "@/features/templates/types";
import { formatEventDate, formatEventTime } from "@/lib/utils/dates";
import { loadCardFont, type CardFont } from "@/features/invitations/card-fonts";
import type { FontKey } from "@/features/templates/fonts";

export const CARD_SIZE = { width: 1200, height: 630 };

const DEFAULT_STYLE: Required<CardStyle> = { align: "center", titleWeight: 500, titleItalic: false, titleUppercase: false, titleTracking: 0, eyebrow: "spaced", frame: "inset" };

/** Title size steps by length, so long couple names still fit on two lines. */
function titleSize(text: string, uppercase: boolean): number {
  const n = text.length * (uppercase ? 1.15 : 1);
  return n <= 14 ? 112 : n <= 22 ? 96 : n <= 32 ? 78 : 62;
}

interface CardData {
  style: Required<CardStyle>;
  colors: { bg: string; text: string; muted: string; accent: string; accentContrast: string; border: string };
  /** Font family names as registered with the renderer. */
  display: string;
  body: string;
  eyebrow: string;
  headline: string;
  title: string;
  subheading: string;
  date: string;
  detail: string;
}

function cardData(view: InvitationView): CardData & { fontKeys: { display: FontKey; body: FontKey } } {
  const def = getTemplateOrFallback(view.template.key);
  const palette = def.palettes.find((p) => p.id === view.theme.paletteId) ?? def.palettes.find((p) => p.id === def.defaults.paletteId) ?? def.palettes[0];
  const fonts = def.fontPairings.find((f) => f.id === view.theme.fontPairingId) ?? def.fontPairings.find((f) => f.id === def.defaults.fontPairingId) ?? def.fontPairings[0];
  const style = { ...DEFAULT_STYLE, ...def.card };
  const { content } = view;
  const parts = titleParts(content);
  const time = formatEventTime(content.startsAt, content.timezone);
  return {
    style,
    colors: palette.vars,
    display: "serif",
    body: "sans-serif",
    fontKeys: { display: fonts.display, body: fonts.body },
    eyebrow: kindDetails(view).eyebrow || "You're invited",
    headline: parts.headline ?? "",
    title: style.titleUppercase ? parts.title.toUpperCase() : parts.title,
    subheading: content.subheading,
    date: formatEventDate(content.startsAt, content.timezone),
    detail: [time, content.venue.name].filter(Boolean).join(" · "),
  };
}

/**
 * The invitation as a card image: Open Graph previews (/e/[slug]) and
 * dashboard thumbnails. Set in the invitation's own fonts and palette, with
 * the template's card style (alignment, title weight, case, frame), so the
 * card reads like the invitation's opening. Satori rules apply: elements with
 * several children need display:flex.
 */
export function InvitationCardImage({ data }: { data: CardData }) {
  const { style: s, colors: c } = data;
  const center = s.align === "center";
  const size = titleSize(data.title, s.titleUppercase);
  const eyebrowSpaced = data.eyebrow.toUpperCase();

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: c.bg, color: c.text, fontFamily: data.body }}>
      {s.frame !== "none" ? <div style={{ position: "absolute", top: 28, left: 28, right: 28, bottom: 28, border: `2px solid ${s.frame === "double" ? c.accent : c.border}`, display: "flex" }} /> : null}
      {s.frame === "double" ? <div style={{ position: "absolute", top: 40, left: 40, right: 40, bottom: 40, border: `1px solid ${c.border}`, display: "flex" }} /> : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: center ? "center" : "flex-start",
          textAlign: center ? "center" : "left",
          width: "100%",
          height: "100%",
          padding: s.frame === "none" ? "72px 80px" : "84px 96px",
        }}
      >
        {s.eyebrow === "pill" ? (
          <div style={{ display: "flex", background: c.accent, color: c.accentContrast, borderRadius: 999, padding: "10px 28px", fontSize: 22, fontWeight: 600, letterSpacing: 3 }}>{eyebrowSpaced}</div>
        ) : (
          <div style={{ display: "flex", fontSize: 22, fontWeight: 600, letterSpacing: 7, color: c.accent }}>{eyebrowSpaced}</div>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: center ? "center" : "flex-start", gap: 14 }}>
          {data.headline ? <div style={{ display: "flex", fontSize: 30, color: c.muted }}>{data.headline}</div> : null}
          <div
            style={{
              display: "flex",
              fontFamily: data.display,
              fontSize: size,
              fontWeight: s.titleWeight,
              fontStyle: s.titleItalic ? "italic" : "normal",
              letterSpacing: `${s.titleTracking}em`,
              lineHeight: 1.04,
              maxWidth: 1000,
              justifyContent: center ? "center" : "flex-start",
            }}
          >
            {data.title}
          </div>
          {data.subheading ? <div style={{ display: "flex", fontSize: 32, color: c.muted }}>{data.subheading}</div> : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: center ? "center" : "flex-start", gap: 14 }}>
          {center ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 90, height: 2, background: c.accent, opacity: 0.6, display: "flex" }} />
              <div style={{ width: 12, height: 12, background: c.accent, transform: "rotate(45deg)", display: "flex" }} />
              <div style={{ width: 90, height: 2, background: c.accent, opacity: 0.6, display: "flex" }} />
            </div>
          ) : (
            <div style={{ width: 120, height: 6, background: c.accent, display: "flex" }} />
          )}
          <div style={{ display: "flex", fontSize: 26, fontWeight: 600, letterSpacing: 4 }}>{data.date.toUpperCase()}</div>
          {data.detail ? <div style={{ display: "flex", fontSize: 24, color: c.muted }}>{data.detail}</div> : null}
        </div>
      </div>
    </div>
  );
}

/** Renders the card image with the invitation's fonts (subset to the text drawn; default font if they cannot be fetched). */
export async function renderInvitationCard(view: InvitationView, init?: ResponseInit): Promise<ImageResponse> {
  const data = cardData(view);
  const bodyText = [data.eyebrow.toUpperCase(), data.headline, data.subheading, data.date.toUpperCase(), data.detail, "0123456789·:–"].join("");
  const [display, body, bodyBold] = await Promise.all([
    loadCardFont(data.fontKeys.display, data.style.titleWeight, data.style.titleItalic, data.title),
    loadCardFont(data.fontKeys.body, 400, false, bodyText),
    loadCardFont(data.fontKeys.body, 600, false, bodyText),
  ]);
  const fonts = [display, body, bodyBold].filter((f): f is CardFont => f !== null);
  // The layout refers to fonts by family name; fall back to the renderer's default when a download failed.
  const named = { ...data, display: display?.name ?? "serif", body: (body ?? bodyBold)?.name ?? "sans-serif" };
  return new ImageResponse(<InvitationCardImage data={named} />, { ...CARD_SIZE, fonts, ...init });
}

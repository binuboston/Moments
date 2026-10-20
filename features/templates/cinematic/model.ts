import type { InvitationView, MediaItem } from "@/features/templates/types";
import { titleParts } from "@/features/templates/title";
import { buildShareMessage } from "@/lib/utils/share";
import { formatEventDate, formatTimeZoneLabel, safeTimeZone, zonedParts } from "@/lib/utils/dates";

export interface DateParts {
  weekday: string;
  day: number;
  month: number;
  monthName: string;
  year: number;
  /** 0 = Sunday, weekday of the 1st of the month in the event's time zone. */
  firstWeekday: number;
  daysInMonth: number;
}

/** Everything a cinematic section needs, derived once from the validated view. */
export interface CinematicModel {
  slug: string;
  title: string;
  headline: string;
  subheading: string;
  hosts: string;
  invocation: string;
  regionalTitle: string;
  monogram: string;
  intro: string;
  familyLines: string[];
  message: string;
  familyMessage: string;
  hashtag: string;
  ceremonyLabel: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  date: DateParts;
  weekdayDateLabel: string;
  numericDateLabel: string;
  timeLabel: string;
  venueName: string;
  address: string;
  city: string;
  placeLabel: string;
  dressCode: string;
  /** Owner's own maps link, else a Google Maps search for the typed address. Never invented coordinates. */
  directionsUrl: string;
  coverPhoto: MediaItem | null;
  gallery: MediaItem[];
  publicUrl: string;
  shareText: string;
  shareTitle: string;
  /** Preload hero imagery (true only for the live public page). */
  eager: boolean;
}

export function monogramFor(title: string): string {
  const parts = title.split(/\s+&\s+/);
  if (parts.length === 2) return `${parts[0].trim()[0] ?? ""}${parts[1].trim()[0] ?? ""}`.toUpperCase();
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function dateParts(iso: string, tz: string): DateParts {
  const zone = safeTimeZone(tz);
  const p = zonedParts(iso, zone);
  const date = new Date(iso);
  const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: zone }).format(date);
  const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: zone }).format(date);
  return {
    weekday,
    day: p.day,
    month: p.month,
    monthName,
    year: p.year,
    firstWeekday: new Date(Date.UTC(p.year, p.month - 1, 1)).getUTCDay(),
    daysInMonth: new Date(Date.UTC(p.year, p.month, 0)).getUTCDate(),
  };
}

export function timeLabel(iso: string, tz: string): string {
  const zone = safeTimeZone(tz);
  const t = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: zone }).format(new Date(iso));
  return `${t} ${formatTimeZoneLabel(zone, iso, "en-IN")}`.trim();
}

export function directionsUrlFor(venue: { name: string; address: string; mapsUrl: string }, city: string): string {
  if (venue.mapsUrl) return venue.mapsUrl;
  const query = [venue.name, venue.address, city].map((s) => s.trim()).filter(Boolean).join(", ");
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "";
}

export function buildCinematicModel(view: InvitationView, opts: { eager?: boolean } = {}): CinematicModel {
  const c = view.content;
  const { title, headline } = titleParts(c);
  const parts = dateParts(c.startsAt, c.timezone);
  const pad = (n: number) => String(n).padStart(2, "0");
  const familyLines = c.kind === "wedding" ? [c.familyOne, c.familyTwo].filter(Boolean) : [];
  const placeLabel = [c.venue.name, c.city].filter(Boolean).join(" · ");
  const shareTitleText = headline ? `${title} · ${headline}` : title;
  return {
    slug: view.slug,
    title,
    headline,
    subheading: c.subheading,
    hosts: c.hosts,
    invocation: c.invocation,
    regionalTitle: c.regionalTitle,
    monogram: monogramFor(title),
    intro: c.intro,
    familyLines,
    message: c.message,
    familyMessage: c.familyMessage,
    hashtag: c.hashtag,
    ceremonyLabel: c.ceremonyLabel || "Ceremony",
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    timezone: c.timezone,
    date: parts,
    weekdayDateLabel: formatEventDate(c.startsAt, c.timezone),
    numericDateLabel: `${pad(parts.day)} · ${pad(parts.month)} · ${parts.year}`,
    timeLabel: timeLabel(c.startsAt, c.timezone),
    venueName: c.venue.name,
    address: c.venue.address,
    city: c.city,
    placeLabel,
    dressCode: c.dressCode,
    directionsUrl: directionsUrlFor(c.venue, c.city),
    coverPhoto: view.media.cover,
    gallery: view.media.gallery,
    publicUrl: view.publicUrl,
    shareTitle: shareTitleText,
    eager: opts.eager ?? false,
    shareText: buildShareMessage({ headline: shareTitleText, dateLabel: formatEventDate(c.startsAt, c.timezone), url: view.publicUrl }),
  };
}

export type CountdownPhase = "upcoming" | "live" | "past";

/** Honest event phase: live until endsAt (or 12 hours after start), then past. */
export function countdownPhase(startsAt: string, endsAt: string, now: number): CountdownPhase {
  const start = new Date(startsAt).getTime();
  if (Number.isNaN(start)) return "past";
  if (now < start) return "upcoming";
  const end = endsAt ? new Date(endsAt).getTime() : start + 12 * 3_600_000;
  return now < (Number.isNaN(end) ? start + 12 * 3_600_000 : end) ? "live" : "past";
}

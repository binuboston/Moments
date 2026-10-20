/** Date helpers built on Intl so they need no dependencies and respect the event's own time zone. */

export function safeTimeZone(tz: string | undefined | null): string {
  if (!tz) return "UTC";
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

/*
 * Display formatting is deterministic on purpose. Intl's *text* output differs
 * between Node and browsers as CLDR data changes (e.g. newer en-GB data drops
 * the comma after the weekday), which caused hydration mismatches for dates
 * rendered in client components. Intl is still used to compute numeric parts in
 * the event's time zone (stable across engines); names and punctuation are ours.
 */
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function zonedOrNull(iso: string, tz: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const p = zonedParts(iso, tz);
  return { ...p, weekday: new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() };
}

/** "Saturday, 20 June 2026" in the event's time zone. */
export function formatEventDate(iso: string, tz: string): string {
  const p = zonedOrNull(iso, tz);
  return p ? `${WEEKDAYS[p.weekday]}, ${p.day} ${MONTHS[p.month - 1]} ${p.year}` : "";
}

/** "20 Jun 2026" in the event's time zone. */
export function formatShortDate(iso: string, tz: string): string {
  const p = zonedOrNull(iso, tz);
  return p ? `${p.day} ${MONTHS[p.month - 1].slice(0, 3)} ${p.year}` : "";
}

/** "18:30" (24-hour) in the event's time zone. */
export function formatEventTime(iso: string, tz: string): string {
  const p = zonedOrNull(iso, tz);
  return p ? `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}` : "";
}

export function formatTimeRange(startIso: string, endIso: string | "" | undefined, tz: string): string {
  const start = formatEventTime(startIso, tz);
  if (!endIso) return start;
  const end = formatEventTime(endIso, tz);
  return end ? `${start} – ${end}` : start;
}

/** UTC offset label such as "GMT", "GMT+1" or "GMT+5:30" (deterministic, no CLDR abbreviations). */
export function formatTimeZoneLabel(tz: string, iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const offset = offsetMinutes(d, safeTimeZone(tz));
  if (offset === 0) return "GMT";
  const sign = offset > 0 ? "+" : "-";
  const h = Math.floor(Math.abs(offset) / 60);
  const m = Math.abs(offset) % 60;
  return `GMT${sign}${h}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

/** Parts of a date in a given time zone, for calendars and inputs. */
export function zonedParts(iso: string, tz: string) {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: safeTimeZone(tz),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(d)) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour === "24" ? "0" : map.hour),
    minute: Number(map.minute),
  };
}

/** Value for <input type="datetime-local"> representing `iso` in `tz`. */
export function toLocalInputValue(iso: string, tz: string): string {
  if (!iso) return "";
  const p = zonedParts(iso, tz);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/**
 * Converts a datetime-local value (wall clock in `tz`) to an ISO string with offset.
 * Uses an iterative offset search so DST boundaries resolve correctly.
 */
export function fromLocalInputValue(value: string, tz: string): string {
  if (!value) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value);
  if (!m) return "";
  const [, y, mo, d, h, mi] = m.map(Number) as unknown as number[];
  const asUtc = Date.UTC(y, mo - 1, d, h, mi);
  const zone = safeTimeZone(tz);
  let guess = asUtc;
  for (let i = 0; i < 3; i++) {
    const offset = offsetMinutes(new Date(guess), zone);
    const next = asUtc - offset * 60_000;
    if (next === guess) break;
    guess = next;
  }
  return formatIsoWithOffset(new Date(guess), zone);
}

export function offsetMinutes(date: Date, tz: string): number {
  const p = zonedParts(date.toISOString(), tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return Math.round((asUtc - date.getTime()) / 60_000);
}

export function formatIsoWithOffset(date: Date, tz: string): string {
  const offset = offsetMinutes(date, tz);
  const p = zonedParts(date.toISOString(), tz);
  const pad = (n: number) => String(Math.abs(n)).padStart(2, "0");
  const sign = offset >= 0 ? "+" : "-";
  const oh = Math.floor(Math.abs(offset) / 60);
  const om = Math.abs(offset) % 60;
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:00${sign}${pad(oh)}:${pad(om)}`;
}

export function isPast(iso: string, now = Date.now()): boolean {
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && t < now;
}

export function nextRoundHourIso(tz: string, daysAhead = 30): string {
  const d = new Date(Date.now() + daysAhead * 86_400_000);
  d.setUTCMinutes(0, 0, 0);
  return formatIsoWithOffset(d, safeTimeZone(tz));
}

export const COMMON_TIMEZONES = [
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Istanbul",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
  "America/Sao_Paulo",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Mexico_City",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Africa/Johannesburg",
] as const;

export function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

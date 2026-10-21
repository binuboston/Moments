/**
 * Calendar arithmetic on local date strings ("2026-12-12") and times
 * ("18:30") in the event's own time zone. Pure and deterministic: all maths
 * goes through Date.UTC, so the visitor's browser time zone never leaks in.
 * Convert to and from ISO with toLocalInputValue / fromLocalInputValue.
 */
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const pad = (n: number) => String(n).padStart(2, "0");

function parts(date: string): { y: number; m: number; d: number } {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m, d };
}

function fromUtc(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

const utc = (date: string) => {
  const { y, m, d } = parts(date);
  return Date.UTC(y, m - 1, d);
};

export function isLocalDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** "2026-12-12T18:30" → { date: "2026-12-12", time: "18:30" } (empty parts for ""). */
export function splitLocal(value: string): { date: string; time: string } {
  const [date = "", time = ""] = value.split("T");
  return { date, time: time.slice(0, 5) };
}

export function joinLocal(date: string, time: string): string {
  return `${date}T${time}`;
}

export function addDays(date: string, days: number): string {
  return fromUtc(utc(date) + days * 86_400_000);
}

export function addMonths(date: string, months: number): string {
  const { y, m, d } = parts(date);
  const first = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  return `${first.getUTCFullYear()}-${pad(first.getUTCMonth() + 1)}-${pad(Math.min(d, last))}`;
}

/** Adds minutes to a local date-time, rolling over midnight. */
export function addMinutesLocal(value: string, minutes: number): string {
  const { date, time } = splitLocal(value);
  const [h, min] = time.split(":").map(Number);
  const ms = utc(date) + (h * 60 + min + minutes) * 60_000;
  const d = new Date(ms);
  return joinLocal(fromUtc(ms), `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`);
}

/** Minutes from one local date-time to another (negative when `b` is earlier). */
export function minutesBetween(a: string, b: string): number {
  const toMs = (v: string) => {
    const { date, time } = splitLocal(v);
    const [h, m] = time.split(":").map(Number);
    return utc(date) + (h * 60 + m) * 60_000;
  };
  return Math.round((toMs(b) - toMs(a)) / 60_000);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((utc(b) - utc(a)) / 86_400_000);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekdayOf(date: string): number {
  return new Date(utc(date)).getUTCDay();
}

/** The next given weekday after `from` (or `from` itself when `includeToday`). */
export function nextWeekday(from: string, weekday: number, includeToday = false): string {
  const diff = (weekday - weekdayOf(from) + 7) % 7;
  return addDays(from, diff === 0 && !includeToday ? 7 : diff);
}

/** Today's date in a time zone. */
export function todayIn(tz: string, now: Date = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  return fmt.format(now);
}

/** Weeks (Sunday first) covering a month; days outside the month are null. */
export function monthMatrix(year: number, month: number): (string | null)[][] {
  const first = `${year}-${pad(month)}-01`;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (string | null)[] = [...Array(weekdayOf(first)).fill(null), ...Array.from({ length: days }, (_, i) => `${year}-${pad(month)}-${pad(i + 1)}`)];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}

/** "Saturday, 12 December 2026". */
export function formatLocalDate(date: string): string {
  const { y, m, d } = parts(date);
  return `${WEEKDAYS[weekdayOf(date)]}, ${d} ${MONTHS[m - 1]} ${y}`;
}

/** "Sat 12 Dec". */
export function formatLocalDateShort(date: string): string {
  const { m, d } = parts(date);
  return `${WEEKDAYS[weekdayOf(date)].slice(0, 3)} ${d} ${MONTHS[m - 1].slice(0, 3)}`;
}

/** "18:30" → "6:30 pm". */
export function formatTime12(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return "";
  const suffix = h < 12 ? "am" : "pm";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m)} ${suffix}`;
}

/** 210 → "3 h 30 min". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h ? `${h} h` : "", m ? `${m} min` : ""].filter(Boolean).join(" ") || "0 min";
}

/** Every `step` minutes of the day, as "HH:mm". */
export function timeSlots(step = 15): string[] {
  return Array.from({ length: (24 * 60) / step }, (_, i) => `${pad(Math.floor((i * step) / 60))}:${pad((i * step) % 60)}`);
}

/** "in 3 days", "tomorrow", "today", "2 days ago". */
export function relativeDays(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  if (days > 0) return days >= 60 ? `in ${Math.round(days / 30)} months` : `in ${days} days`;
  return `${-days} days ago`;
}

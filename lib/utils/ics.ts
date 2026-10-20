import { addHours, toGoogleUtc } from "@/lib/utils/share";
import { BRAND } from "@/lib/brand";

export interface IcsEvent {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  url?: string;
  startIso: string;
  endIso?: string;
}

function escapeIcs(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds long lines at 75 octets per RFC 5545. */
function fold(line: string): string {
  const out: string[] = [];
  let current = line;
  while (current.length > 73) {
    out.push(current.slice(0, 73));
    current = ` ${current.slice(73)}`;
  }
  out.push(current);
  return out.join("\r\n");
}

export function buildIcs(event: IcsEvent, prodId: string = BRAND.icsProdId): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${prodId}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(event.uid)}`,
    `DTSTAMP:${toGoogleUtc(new Date().toISOString())}`,
    `DTSTART:${toGoogleUtc(event.startIso)}`,
    `DTEND:${toGoogleUtc(event.endIso || addHours(event.startIso, 2))}`,
    `SUMMARY:${escapeIcs(event.title)}`,
  ];
  if (event.description) lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`);
  if (event.url) lines.push(`URL:${escapeIcs(event.url)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

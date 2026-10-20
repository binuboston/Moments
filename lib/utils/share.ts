/** Share link builders. Pure functions; tested in tests/unit/share.test.ts. */

export function whatsappShareUrl(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildShareMessage(opts: { headline: string; dateLabel?: string; url: string }): string {
  const lines = [`You're invited: ${opts.headline}`];
  if (opts.dateLabel) lines.push(opts.dateLabel);
  lines.push(opts.url);
  return lines.join("\n");
}

export function smsShareUrl(message: string): string {
  return `sms:?&body=${encodeURIComponent(message)}`;
}

export function emailShareUrl(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function telegramShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

/** Google Calendar "add event" link. Dates are UTC in basic ISO format. */
export function googleCalendarUrl(opts: { title: string; startIso: string; endIso?: string; details?: string; location?: string }): string {
  const start = toGoogleUtc(opts.startIso);
  const end = toGoogleUtc(opts.endIso || addHours(opts.startIso, 2));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${start}/${end}`,
  });
  if (opts.details) params.set("details", opts.details);
  if (opts.location) params.set("location", opts.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function toGoogleUtc(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function addHours(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 3_600_000).toISOString();
}

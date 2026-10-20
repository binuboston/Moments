import { describe, expect, it } from "vitest";
import { buildIcs } from "@/lib/utils/ics";
import { buildShareMessage, googleCalendarUrl, whatsappShareUrl } from "@/lib/utils/share";

describe("share links", () => {
  it("builds a WhatsApp link with the encoded message", () => {
    const url = whatsappShareUrl("You're invited: Aisha & Rohan\nhttps://mirth.app/e/aisha-rohan-x1y2");
    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    const decoded = decodeURIComponent(url.split("text=")[1]);
    expect(decoded).toContain("Aisha & Rohan");
    expect(decoded).toContain("https://mirth.app/e/aisha-rohan-x1y2");
  });

  it("builds a readable share message", () => {
    expect(buildShareMessage({ headline: "Maya turns five", dateLabel: "Saturday, 20 June 2026", url: "https://x/e/maya" })).toBe(
      "You're invited: Maya turns five\nSaturday, 20 June 2026\nhttps://x/e/maya",
    );
  });

  it("builds a Google Calendar link with UTC basic dates", () => {
    const url = new URL(googleCalendarUrl({ title: "Party", startIso: "2026-06-20T18:30:00+01:00", location: "Kew" }));
    expect(url.searchParams.get("dates")).toBe("20260620T173000Z/20260620T193000Z");
    expect(url.searchParams.get("location")).toBe("Kew");
  });
});

describe("ics", () => {
  it("produces a valid VCALENDAR with escaped fields", () => {
    const ics = buildIcs({ uid: "abc@mirth", title: "Dinner, drinks; dancing", startIso: "2026-06-20T18:30:00+01:00", location: "The Orangery, Kew" });
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("DTSTART:20260620T173000Z");
    expect(ics).toContain("SUMMARY:Dinner\\, drinks\; dancing");
    expect(ics).toContain("LOCATION:The Orangery\\, Kew");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });
});

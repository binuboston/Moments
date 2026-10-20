import { describe, expect, it } from "vitest";
import { formatDotDate, formatEventDate, monthGrid, formatEventTime, formatShortDate, formatTimeRange, formatTimeZoneLabel, fromLocalInputValue, isPast, safeTimeZone, toLocalInputValue } from "@/lib/utils/dates";

describe("time zone helpers", () => {
  it("falls back to UTC for unknown zones", () => {
    expect(safeTimeZone("Mars/Olympus")).toBe("UTC");
    expect(safeTimeZone("Europe/London")).toBe("Europe/London");
  });

  it("formats dates in the event's zone", () => {
    const iso = "2026-06-20T18:30:00+01:00";
    expect(formatEventDate(iso, "Europe/London")).toBe("Saturday, 20 June 2026");
    expect(formatEventTime(iso, "Europe/London").replace(/\s/g, " ")).toMatch(/18:30|6:30 pm/i);
    // Same instant in Kolkata is 23:00
    expect(formatEventTime(iso, "Asia/Kolkata").replace(/\s/g, " ")).toMatch(/23:00|11:00 pm/i);
  });

  it("round-trips datetime-local values through a time zone", () => {
    const local = "2026-03-29T02:30"; // DST gap in Europe/London does not exist at 02:30 on this date; use a safe date
    const iso = fromLocalInputValue("2026-06-20T18:30", "Europe/London");
    expect(iso).toBe("2026-06-20T18:30:00+01:00");
    expect(toLocalInputValue(iso, "Europe/London")).toBe("2026-06-20T18:30");
    expect(toLocalInputValue(fromLocalInputValue(local, "Asia/Kolkata"), "Asia/Kolkata")).toBe(local);
  });

  it("handles winter offsets", () => {
    expect(fromLocalInputValue("2026-01-15T09:00", "America/New_York")).toBe("2026-01-15T09:00:00-05:00");
    expect(fromLocalInputValue("2026-07-15T09:00", "America/New_York")).toBe("2026-07-15T09:00:00-04:00");
  });

  it("detects past dates", () => {
    expect(isPast("2000-01-01T00:00:00Z")).toBe(true);
    expect(isPast("2999-01-01T00:00:00Z")).toBe(false);
  });
});

describe("deterministic display formatting (identical on server and browser)", () => {
  it("formats exact strings in the event's zone", () => {
    const iso = "2026-12-31T23:30:00Z";
    expect(formatEventDate(iso, "UTC")).toBe("Thursday, 31 December 2026");
    expect(formatEventDate(iso, "Asia/Kolkata")).toBe("Friday, 1 January 2027");
    expect(formatShortDate(iso, "Asia/Kolkata")).toBe("1 Jan 2027");
    expect(formatEventTime(iso, "Asia/Kolkata")).toBe("05:00");
    expect(formatTimeRange("2026-06-20T18:30:00+01:00", "2026-06-20T23:00:00+01:00", "Europe/London")).toBe("18:30 – 23:00");
  });

  it("labels offsets without locale-specific abbreviations", () => {
    expect(formatTimeZoneLabel("UTC", "2026-06-20T12:00:00Z")).toBe("GMT");
    expect(formatTimeZoneLabel("Europe/London", "2026-06-20T12:00:00Z")).toBe("GMT+1");
    expect(formatTimeZoneLabel("Asia/Kolkata", "2026-06-20T12:00:00Z")).toBe("GMT+5:30");
    expect(formatTimeZoneLabel("America/New_York", "2026-01-20T12:00:00Z")).toBe("GMT-5");
  });

  it("returns empty strings for invalid dates", () => {
    expect(formatEventDate("not a date", "UTC")).toBe("");
    expect(formatEventTime("", "UTC")).toBe("");
  });
});

describe("save-the-date helpers", () => {
  it("formats a dotted date in the event's time zone", () => {
    // 23:30 UTC on 18 Oct is already 19 Oct in India.
    expect(formatDotDate("2026-10-18T23:30:00Z", "Asia/Kolkata")).toBe("19 · 10 · 2026");
  });

  it("builds the event's month grid starting on Sunday", () => {
    expect(monthGrid("2026-10-19T06:10:00Z", "Asia/Kolkata")).toEqual({ year: 2026, month: 10, monthName: "October", day: 19, weekday: "Monday", leading: 4, daysInMonth: 31 });
    expect(monthGrid("2028-02-10T12:00:00Z", "UTC")).toMatchObject({ leading: 2, daysInMonth: 29 });
    expect(monthGrid("not a date", "UTC")).toBeNull();
  });
});

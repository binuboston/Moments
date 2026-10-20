import { describe, expect, it } from "vitest";
import { formatEventDate, formatEventTime, fromLocalInputValue, isPast, safeTimeZone, toLocalInputValue } from "@/lib/utils/dates";

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

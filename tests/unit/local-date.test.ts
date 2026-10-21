import { describe, expect, it } from "vitest";
import { addDays, addMinutesLocal, addMonths, daysBetween, formatDuration, formatLocalDate, formatTime12, minutesBetween, monthMatrix, nextWeekday, relativeDays, splitLocal, timeSlots, todayIn, weekdayOf } from "@/lib/utils/local-date";

describe("local date arithmetic", () => {
  it("splits and rolls dates across months, years and leap days", () => {
    expect(splitLocal("2026-12-12T18:30")).toEqual({ date: "2026-12-12", time: "18:30" });
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMinutesLocal("2026-12-31T22:30", 180)).toBe("2027-01-01T01:30");
    expect(minutesBetween("2026-12-12T18:00", "2026-12-12T21:30")).toBe(210);
    expect(daysBetween("2026-10-22", "2026-12-12")).toBe(51);
  });

  it("finds weekdays", () => {
    expect(weekdayOf("2026-12-12")).toBe(6); // Saturday
    expect(nextWeekday("2026-12-12", 6)).toBe("2026-12-19");
    expect(nextWeekday("2026-12-12", 6, true)).toBe("2026-12-12");
    expect(nextWeekday("2026-12-10", 6)).toBe("2026-12-12");
  });

  it("builds Sunday-first month grids", () => {
    const weeks = monthMatrix(2026, 2); // February 2026 starts on a Sunday
    expect(weeks[0][0]).toBe("2026-02-01");
    expect(weeks.flat().filter(Boolean)).toHaveLength(28);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });

  it("formats for people", () => {
    expect(formatLocalDate("2026-12-12")).toBe("Saturday, 12 December 2026");
    expect(formatTime12("00:15")).toBe("12:15 am");
    expect(formatTime12("12:00")).toBe("12:00 pm");
    expect(formatTime12("18:30")).toBe("6:30 pm");
    expect(formatDuration(210)).toBe("3 h 30 min");
    expect(relativeDays(1)).toBe("tomorrow");
    expect(relativeDays(90)).toBe("in 3 months");
    expect(timeSlots(30)).toHaveLength(48);
  });

  it("reads today in the event's time zone, not the browser's", () => {
    const instant = new Date("2026-10-21T20:00:00Z");
    expect(todayIn("Asia/Kolkata", instant)).toBe("2026-10-22");
    expect(todayIn("America/New_York", instant)).toBe("2026-10-21");
  });
});

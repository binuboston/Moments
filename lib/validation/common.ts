import { z } from "zod";

/** Trimmed text that may be empty. Empty string means "not provided". */
export const optionalText = (max: number) => z.string().trim().max(max).default("");

export const requiredText = (max: number, min = 1) => z.string().trim().min(min).max(max);

export const httpsUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https:\/\//i.test(v), "Must be a secure https:// link")
  .default("");

export const isoDateTime = z.iso.datetime({ offset: true, message: "Enter a valid date and time" });

export const timezone = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .refine((tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }, "Unknown time zone")
  .default("UTC");

export const uuid = z.uuid();

"use client";

import { ClockIcon, GlobeIcon, PlusIcon, XIcon } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useContentForm } from "@/features/invitations/editor/content-form";
import { DateTimePicker } from "@/features/invitations/editor/date-time-picker";
import { TimezoneField } from "@/features/invitations/editor/fields";
import { cn } from "@/lib/utils/cn";
import { formatTimeZoneLabel, fromLocalInputValue, toLocalInputValue } from "@/lib/utils/dates";
import { addMinutesLocal, daysBetween, formatDuration, formatLocalDate, formatTime12, minutesBetween, relativeDays, splitLocal, todayIn } from "@/lib/utils/local-date";

const DURATIONS = [60, 120, 180, 240, 360];

/** Date, time, optional end and time zone, with a plain-language summary of what guests will see. */
export function WhenStep() {
  const { form, err } = useContentForm();
  const [startsAt, endsAt, timezone] = useWatch({ control: form.control, name: ["startsAt", "endsAt", "timezone"] });
  const start = startsAt ? toLocalInputValue(startsAt, timezone) : "";
  const end = endsAt ? toLocalInputValue(endsAt, timezone) : "";
  const length = start && end ? minutesBetween(start, end) : 0;

  const setEnd = (local: string) => form.setValue("endsAt", local ? fromLocalInputValue(local, timezone) : "", { shouldDirty: true, shouldValidate: true });

  // Keep the same wall-clock time when the time zone changes.
  const changeTimezone = (tz: string) => {
    const prev = form.getValues("timezone");
    form.setValue("timezone", tz, { shouldDirty: true });
    if (startsAt) form.setValue("startsAt", fromLocalInputValue(toLocalInputValue(startsAt, prev), tz), { shouldDirty: true });
    if (endsAt) form.setValue("endsAt", fromLocalInputValue(toLocalInputValue(endsAt, prev), tz), { shouldDirty: true });
  };

  const { date, time } = splitLocal(start);
  const endParts = splitLocal(end);
  const days = date ? daysBetween(todayIn(timezone), date) : null;

  return (
    <div className="grid gap-6">
      <Controller
        control={form.control}
        name="startsAt"
        render={({ field }) => (
          <DateTimePicker
            id="content-startsAt"
            label="Starts"
            value={field.value}
            timezone={timezone}
            error={err("startsAt")}
            onChange={(iso) => {
              // Moving the start keeps the event's length.
              if (start && end && length > 0) setEnd(addMinutesLocal(toLocalInputValue(iso, timezone), length));
              field.onChange(iso);
            }}
          />
        )}
      />

      <div className="grid gap-3">
        {end ? (
          <>
            <Controller
              control={form.control}
              name="endsAt"
              render={({ field }) => <DateTimePicker id="content-endsAt" label="Ends" optional value={field.value} timezone={timezone} min={startsAt} error={err("endsAt")} onChange={field.onChange} />}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setEnd(addMinutesLocal(start, m))}
                  className={cn("rounded-full px-3 py-1.5 text-sm transition-colors", length === m ? "bg-foreground text-background" : "bg-fill hover:bg-fill-hover")}
                >
                  {formatDuration(m)}
                </button>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => setEnd("")}>
                <XIcon aria-hidden /> Remove end time
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Add an end time:</span>
            {DURATIONS.slice(0, 4).map((m) => (
              <button key={m} type="button" disabled={!start} onClick={() => setEnd(addMinutesLocal(start, m))} className="rounded-full bg-fill px-3 py-1.5 text-sm transition-colors hover:bg-fill-hover disabled:opacity-40">
                <PlusIcon className="mr-1 inline size-3.5" aria-hidden />
                {formatDuration(m)}
              </button>
            ))}
          </div>
        )}
      </div>

      <TimezoneField id="content-timezone" label="Time zone" hint="Guests see the time exactly as you set it, with the zone next to it." value={timezone} onChange={changeTimezone} error={err("timezone")} />

      {date ? (
        <div className="flex items-start gap-3 rounded-2xl bg-fill px-4 py-3 text-sm" aria-live="polite">
          <ClockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p>
            <span className="font-semibold">{formatLocalDate(date)}</span>
            {time ? `, ${formatTime12(time)}` : ""}
            {endParts.time ? ` – ${endParts.date !== date ? `${formatLocalDate(endParts.date)}, ` : ""}${formatTime12(endParts.time)}` : ""}
            <span className="text-muted-foreground">
              {" "}
              <GlobeIcon className="mb-0.5 inline size-3.5" aria-hidden /> {formatTimeZoneLabel(timezone, startsAt)}
              {days !== null ? ` · ${relativeDays(days)}` : ""}
            </span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

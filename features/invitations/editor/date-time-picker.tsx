"use client";

import { CalendarDaysIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Dialog as DialogPrimitive, Popover as PopoverPrimitive } from "radix-ui";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Field, fieldAria } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { fromLocalInputValue, toLocalInputValue } from "@/lib/utils/dates";
import {
  addDays,
  addMonths,
  formatLocalDate,
  formatLocalDateShort,
  formatTime12,
  joinLocal,
  monthLabel,
  monthMatrix,
  nextWeekday,
  splitLocal,
  timeSlots,
  todayIn,
} from "@/lib/utils/local-date";

const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_TIME = "18:00";
const SLOTS = timeSlots(15);

/** Wide enough for a floating panel; below this the picker opens as a bottom sheet. */
const WIDE = "(min-width: 640px)";
function useWide() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(WIDE);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(WIDE).matches,
    () => true,
  );
}

interface DateTimePickerProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  /** ISO string with offset, or "". */
  value: string;
  timezone: string;
  onChange: (iso: string) => void;
  /** Earliest selectable date-time (ISO), e.g. the start time for an end picker. */
  min?: string;
}

/**
 * Calendar + time picker that edits an ISO date-time in the event's own time
 * zone. Quick picks for the common choices, a keyboard-navigable month grid
 * (arrows, Home/End, PageUp/PageDown, Enter) and a 15-minute time list.
 */
export function DateTimePicker({ id, label, hint, error, optional, value, timezone, onChange, min }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const wide = useWide();
  const local = value ? toLocalInputValue(value, timezone) : "";
  const { date, time } = splitLocal(local);
  const minLocal = min ? toLocalInputValue(min, timezone) : "";
  const minDate = splitLocal(minLocal).date;
  const today = todayIn(timezone);

  const commit = (nextDate: string, nextTime: string) => onChange(fromLocalInputValue(joinLocal(nextDate, nextTime), timezone));
  const pickDate = (d: string) => commit(d, time || DEFAULT_TIME);
  const pickTime = (t: string) => commit(date || (minDate && minDate > today ? minDate : today), t);

  const quick = [
    { label: "Tomorrow", date: addDays(today, 1) },
    { label: "This Saturday", date: nextWeekday(today, 6, true) },
    { label: "Next Saturday", date: addDays(nextWeekday(today, 6, true), 7) },
    { label: "In a month", date: addMonths(today, 1) },
  ].filter((q) => !minDate || q.date >= minDate);

  const trigger = (
    <button
      type="button"
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl border bg-surface px-3 py-2.5 text-left transition-[border-color,box-shadow] hover:border-ring/60 focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/25 focus-visible:outline-none",
        error ? "border-destructive" : "border-input",
        open && "border-ring ring-4 ring-ring/25",
      )}
      {...fieldAria(id, { error, hint })}
      data-testid={`${id}-trigger`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tone-rose text-tone-rose-ink" aria-hidden>
        <CalendarDaysIcon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate font-medium", !date && "text-muted-foreground")}>{date ? formatLocalDate(date) : "Pick a date"}</span>
        <span className="block truncate text-sm text-muted-foreground">{time ? formatTime12(time) : "and a time"}</span>
      </span>
      <ChevronDownIcon className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden />
    </button>
  );

  const panel = (
    <>
      {quick.length ? (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-3 no-scrollbar" role="group" aria-label="Quick picks">
          {quick.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => pickDate(q.date)}
              className={cn("shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors", q.date === date ? "bg-foreground text-background" : "bg-fill hover:bg-fill-hover")}
            >
              {q.label}
              <span className="ml-1.5 text-xs opacity-70">{formatLocalDateShort(q.date)}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[minmax(0,1fr)_8.5rem]">
        <Calendar selected={date} today={today} minDate={minDate} onSelect={pickDate} />
        <TimeList selected={time} onSelect={pickTime} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <p className="min-w-0 truncate text-sm text-muted-foreground" aria-live="polite">
          {date ? `${formatLocalDateShort(date)}${time ? ` · ${formatTime12(time)}` : ""}` : "No date yet"}
        </p>
        <Button type="button" size="sm" onClick={() => setOpen(false)}>
          Done
        </Button>
      </div>
    </>
  );

  return (
    <Field id={id} label={label} hint={hint} error={error} optional={optional}>
      {wide ? (
        <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
          <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              align="start"
              sideOffset={8}
              collisionPadding={12}
              className="z-[60] w-[min(calc(100vw-1.5rem),35rem)] rounded-3xl bg-surface p-4 shadow-float ring-1 ring-black/5 outline-none data-[state=open]:animate-pop-in"
              aria-label={`${label}: choose date and time`}
            >
              {panel}
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>
      ) : (
        // Phones: a bottom sheet, always fully on screen and within thumb reach.
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/40 data-[state=open]:animate-fade-in" />
            <DialogPrimitive.Content
              className="fixed inset-x-0 bottom-0 z-[60] max-h-[92dvh] overflow-y-auto overscroll-contain rounded-t-3xl bg-surface px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-float outline-none data-[state=open]:animate-sheet-up"
              aria-describedby={undefined}
            >
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-fill-hover" aria-hidden />
              <DialogPrimitive.Title className="mb-3 text-base font-semibold">{label}</DialogPrimitive.Title>
              {panel}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      )}
    </Field>
  );
}

function Calendar({ selected, today, minDate, onSelect }: { selected: string; today: string; minDate: string; onSelect: (date: string) => void }) {
  const start = selected || (minDate && minDate > today ? minDate : today);
  const [focused, setFocused] = useState(start);
  const [y, m] = focused.split("-").map(Number);
  const grid = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  // After keyboard moves, focus the newly focused day (DOM only).
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
  }, [focused]);

  const move = (next: string) => {
    moved.current = true;
    setFocused(next);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const keys: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      PageUp: () => addMonths(focused, -1),
      PageDown: () => addMonths(focused, 1),
      Home: () => addDays(focused, -new Date(`${focused}T00:00:00Z`).getUTCDay()),
      End: () => addDays(focused, 6 - new Date(`${focused}T00:00:00Z`).getUTCDay()),
    };
    if (keys[e.key]) {
      e.preventDefault();
      move(keys[e.key]());
    }
  };

  const shiftMonth = (delta: number) => setFocused(addMonths(`${y}-${String(m).padStart(2, "0")}-01`, delta));

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold" aria-live="polite" id="calendar-month">
          {monthLabel(y, m)}
        </p>
        <div className="flex gap-1">
          <button type="button" onClick={() => shiftMonth(-1)} className="grid size-9 place-items-center rounded-full hover:bg-fill" aria-label="Previous month">
            <ChevronLeftIcon className="size-4" />
          </button>
          <button type="button" onClick={() => shiftMonth(1)} className="grid size-9 place-items-center rounded-full hover:bg-fill" aria-label="Next month">
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      </div>
      <div ref={grid} role="grid" aria-labelledby="calendar-month" onKeyDown={onKeyDown}>
        <div role="row" className="grid grid-cols-7">
          {WEEKDAY_INITIALS.map((d, i) => (
            <span key={i} role="columnheader" aria-label={WEEKDAY_NAMES[i]} className="py-1 text-center text-xs font-medium text-muted-foreground">
              {d}
            </span>
          ))}
        </div>
        {monthMatrix(y, m).map((week, w) => (
          <div key={w} role="row" className="grid grid-cols-7">
            {week.map((day, i) =>
              day ? (
                <span key={day} role="gridcell" aria-selected={day === selected} className="grid place-items-center py-0.5">
                  <button
                    type="button"
                    data-date={day}
                    tabIndex={day === focused ? 0 : -1}
                    disabled={Boolean(minDate) && day < minDate}
                    onClick={() => {
                      setFocused(day);
                      onSelect(day);
                    }}
                    aria-label={formatLocalDate(day)}
                    aria-current={day === today ? "date" : undefined}
                    className={cn(
                      "relative grid size-10 place-items-center rounded-full text-sm tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-30",
                      day === selected ? "bg-primary font-semibold text-primary-foreground" : "hover:bg-fill",
                      day < today && day !== selected && "text-muted-foreground",
                      day === today && day !== selected && "font-semibold text-primary",
                    )}
                  >
                    {Number(day.slice(8))}
                    {day === today ? <span className="absolute bottom-1 size-1 rounded-full bg-current" aria-hidden /> : null}
                  </button>
                </span>
              ) : (
                <span key={`e${w}-${i}`} role="gridcell" />
              ),
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeList({ selected, onSelect }: { selected: string; onSelect: (time: string) => void }) {
  const list = useRef<HTMLDivElement>(null);
  const slots = selected && !SLOTS.includes(selected) ? [...SLOTS, selected].sort() : SLOTS;

  // Open at the chosen time (or early evening), centred.
  useEffect(() => {
    const target = list.current?.querySelector<HTMLElement>(`[data-time="${selected || DEFAULT_TIME}"]`);
    if (target && list.current) list.current.scrollTop = target.offsetTop - list.current.clientHeight / 2 + target.clientHeight / 2;
    if (target && list.current) list.current.scrollLeft = target.offsetLeft - list.current.clientWidth / 2 + target.clientWidth / 2;
  }, [selected]);

  return (
    <div className="min-w-0">
      <p className="mb-2 text-sm font-semibold sm:text-center">Time</p>
      <div
        ref={list}
        role="listbox"
        aria-label="Time"
        className="relative flex gap-1.5 overflow-x-auto overscroll-contain pb-1 no-scrollbar sm:h-[17.5rem] sm:flex-col sm:overflow-x-hidden sm:overflow-y-auto sm:pb-0"
      >
        {slots.map((t) => (
          <button
            key={t}
            type="button"
            role="option"
            aria-selected={t === selected}
            data-time={t}
            onClick={() => onSelect(t)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-sm tabular-nums transition-colors sm:rounded-xl",
              t === selected ? "bg-primary font-semibold text-primary-foreground" : "bg-fill hover:bg-fill-hover sm:bg-transparent",
            )}
          >
            {formatTime12(t)}
          </button>
        ))}
      </div>
    </div>
  );
}

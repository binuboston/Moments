"use client";

import { cn } from "@/lib/utils/cn";
import { useNow } from "@/hooks/use-now";

interface CountdownProps {
  targetIso: string;
  /** Event end; without it the event counts as running for 12 hours after the start. */
  endIso?: string;
  className?: string;
  cellClassName?: string;
  numberClassName?: string;
  labelClassName?: string;
  /** Shown while the event is happening. */
  liveLabel?: string;
  /** Shown after the event has ended. */
  pastLabel?: string;
}

const DEFAULT_RUN_MS = 12 * 3_600_000;

function diffParts(target: number, now: number) {
  const total = Math.max(0, target - now);
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  return { total, days, hours, minutes, seconds };
}

export function Countdown({
  targetIso,
  endIso,
  className,
  cellClassName,
  numberClassName,
  labelClassName,
  liveLabel = "The celebration has begun",
  pastLabel = "Thank you for celebrating with us",
}: CountdownProps) {
  const target = new Date(targetIso).getTime();
  const now = useNow();

  if (Number.isNaN(target)) return null;

  const parsedEnd = endIso ? new Date(endIso).getTime() : NaN;
  const end = Number.isNaN(parsedEnd) || parsedEnd <= target ? target + DEFAULT_RUN_MS : parsedEnd;
  const parts = now === null ? null : diffParts(target, now);

  if (parts && parts.total === 0) {
    return (
      <p className={cn("inv-display text-2xl text-balance sm:text-3xl", className)} role="status">
        {now !== null && now < end ? liveLabel : pastLabel}
      </p>
    );
  }

  const cells = [
    { label: "Days", value: parts?.days },
    { label: "Hours", value: parts?.hours },
    { label: "Minutes", value: parts?.minutes },
    { label: "Seconds", value: parts?.seconds },
  ];

  return (
    <div className={cn("grid grid-cols-4 gap-2 sm:gap-4", className)} role="timer" aria-live="off" aria-label="Countdown to the event" data-inv-reveal="stagger">
      {cells.map((cell) => {
        const text = cell.value === undefined ? "--" : String(cell.value).padStart(2, "0");
        return (
          <div key={cell.label} className={cn("overflow-hidden rounded-xl border border-(--inv-border) bg-(--inv-surface) px-2 py-3 sm:px-4 sm:py-5", cellClassName)}>
            <div className={cn("inv-display text-3xl tabular-nums sm:text-5xl", numberClassName)} suppressHydrationWarning>
              {/* Keyed on the value so each change replays the tick animation (CSS, motion-safe). */}
              <span key={text} className="inv-tick">
                {text}
              </span>
            </div>
            <div className={cn("mt-1 text-[0.65rem] tracking-[0.18em] uppercase text-(--inv-muted) sm:text-xs", labelClassName)}>{cell.label}</div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils/cn";
import { useNow } from "@/hooks/use-now";

interface CountdownProps {
  targetIso: string;
  className?: string;
  cellClassName?: string;
  numberClassName?: string;
  labelClassName?: string;
  completeLabel?: string;
}

function diffParts(target: number, now: number) {
  const total = Math.max(0, target - now);
  const days = Math.floor(total / 86_400_000);
  const hours = Math.floor((total % 86_400_000) / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  return { total, days, hours, minutes, seconds };
}

export function Countdown({ targetIso, className, cellClassName, numberClassName, labelClassName, completeLabel = "The day is here" }: CountdownProps) {
  const target = new Date(targetIso).getTime();
  const now = useNow();

  if (Number.isNaN(target)) return null;

  const parts = now === null ? null : diffParts(target, now);
  if (parts && parts.total === 0) {
    return (
      <p className={cn("inv-display text-2xl", className)} role="status">
        {completeLabel}
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
    <div className={cn("grid grid-cols-4 gap-2 sm:gap-4", className)} role="timer" aria-live="off" aria-label="Countdown to the event">
      {cells.map((cell) => (
        <div key={cell.label} className={cn("rounded-xl border border-(--inv-border) bg-(--inv-surface) px-2 py-3 sm:px-4 sm:py-4", cellClassName)}>
          <div className={cn("inv-display text-2xl tabular-nums sm:text-4xl", numberClassName)} suppressHydrationWarning>
            {cell.value === undefined ? "--" : String(cell.value).padStart(2, "0")}
          </div>
          <div className={cn("mt-1 text-[0.65rem] tracking-[0.18em] uppercase text-(--inv-muted) sm:text-xs", labelClassName)}>{cell.label}</div>
        </div>
      ))}
    </div>
  );
}

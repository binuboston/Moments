"use client";

import { useNow } from "@/hooks/use-now";
import { countdownPhase, type CinematicModel } from "@/features/templates/cinematic/model";
import { Eyebrow } from "@/features/templates/cinematic/sections/common";

function Digits({ value, label }: { value: number | null; label: string }) {
  const text = value === null ? "--" : String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <span className="inv-display relative flex overflow-hidden text-[clamp(2.6rem,11cqw,5.5rem)] leading-none tabular-nums" aria-hidden>
        {text.split("").map((ch, i) => (
          // Keyed by digit so only changed digits re-mount and roll in.
          <span key={`${i}-${ch}`} className="cine-digit inline-block">
            {ch}
          </span>
        ))}
      </span>
      <span className="mt-3 text-[0.62rem] tracking-[0.32em] text-(--inv-muted) uppercase">{label}</span>
    </div>
  );
}

/** Real-time countdown with honest past states. Only this island re-renders each second. */
export function CinematicCountdown({ model }: { model: Pick<CinematicModel, "startsAt" | "endsAt" | "ceremonyLabel" | "timeLabel" | "title"> }) {
  const now = useNow();
  const phase = now === null ? "upcoming" : countdownPhase(model.startsAt, model.endsAt, now);

  if (phase !== "upcoming") {
    return (
      <div className="flex flex-col items-center text-center" role="status" data-testid="countdown-done">
        <Eyebrow>{phase === "live" ? "Today" : "With gratitude"}</Eyebrow>
        <p className="inv-display mt-5 max-w-xl text-4xl leading-tight text-balance @2xl:text-5xl">{phase === "live" ? "The celebration has begun" : "Thank you for celebrating with us"}</p>
        <p className="mt-4 text-sm text-(--inv-muted)">{phase === "live" ? `${model.ceremonyLabel} · ${model.timeLabel}` : model.title}</p>
      </div>
    );
  }

  const total = now === null ? null : Math.max(0, new Date(model.startsAt).getTime() - now);
  const parts =
    total === null
      ? { d: null, h: null, m: null, s: null }
      : { d: Math.floor(total / 86_400_000), h: Math.floor((total % 86_400_000) / 3_600_000), m: Math.floor((total % 3_600_000) / 60_000), s: Math.floor((total % 60_000) / 1000) };

  return (
    <div className="flex flex-col items-center text-center" data-testid="countdown">
      <Eyebrow>Counting down</Eyebrow>
      <div className="mt-10 grid grid-cols-4 gap-4 @2xl:gap-10" role="timer" aria-label={total === null ? "Countdown loading" : `${parts.d} days, ${parts.h} hours and ${parts.m} minutes until the ${model.ceremonyLabel.toLowerCase()}`}>
        <Digits value={parts.d} label="Days" />
        <Digits value={parts.h} label="Hours" />
        <Digits value={parts.m} label="Minutes" />
        <Digits value={parts.s} label="Seconds" />
      </div>
      <p className="mt-8 text-[0.7rem] tracking-[0.3em] text-(--inv-muted) uppercase">
        until the {model.ceremonyLabel} · {model.timeLabel}
      </p>
    </div>
  );
}

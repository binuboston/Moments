"use client";

import { CheckIcon, PauseIcon, PlayIcon, VolumeXIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { findTrack, formatDuration, MOOD_LABEL, MUSIC_LIBRARY, musicSrc, SUGGESTED_TRACKS, type MusicMood, type MusicTrack } from "@/features/music/library";
import { cn } from "@/lib/utils/cn";
import { useEditorStore } from "@/stores/editor-store";

const MOODS = Object.keys(MOOD_LABEL) as MusicMood[];

/** One shared preview player: starting a track stops the previous one. */
function usePreview() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(
    () => () => {
      audio.current?.pause();
      audio.current = null;
    },
    [],
  );

  const toggle = (track: MusicTrack) => {
    if (current === track.id) {
      audio.current?.pause();
      return;
    }
    audio.current?.pause();
    const el = new Audio(musicSrc(track));
    el.volume = 0.7;
    el.addEventListener("pause", () => setCurrent((c) => (c === track.id ? null : c)));
    el.addEventListener("ended", () => setCurrent((c) => (c === track.id ? null : c)));
    audio.current = el;
    setCurrent(track.id);
    void el.play().catch(() => setCurrent(null));
  };

  return { current, toggle };
}

function Option({ checked, onSelect, label, sub, children }: { checked: boolean; onSelect: () => void; label: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl px-2 py-2 transition-colors", checked ? "bg-fill" : "hover:bg-fill/60")}>
      {children}
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
        <input type="radio" name="music-track" checked={checked} onChange={onSelect} className="peer sr-only" />
        <span className="min-w-0 flex-1 rounded-sm peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
          <span className="block truncate text-sm font-medium">{label}</span>
          {sub ? <span className="block truncate text-xs text-muted-foreground">{sub}</span> : null}
        </span>
        <span aria-hidden className={cn("grid size-6 shrink-0 place-items-center rounded-full transition-colors", checked ? "bg-foreground text-background" : "ring-1 ring-input")}>
          {checked ? <CheckIcon className="size-3.5" /> : null}
        </span>
      </label>
    </div>
  );
}

/** Background music: pick a public-domain track (or none) and preview it here. */
export function MusicPanel() {
  const draft = useEditorStore((s) => s.draft)!;
  const setSettings = useEditorStore((s) => s.setSettings);
  const selected = findTrack(draft.settings.musicTrack)?.id ?? "";
  const suggested = SUGGESTED_TRACKS[draft.categorySlug] ?? [];
  const preview = usePreview();

  const ordered = (mood: MusicMood) => MUSIC_LIBRARY.filter((t) => t.mood === mood).sort((a, b) => Number(suggested.includes(b.id)) - Number(suggested.includes(a.id)));

  return (
    <div className="grid gap-5">
      <p className="text-sm text-muted-foreground text-pretty">
        Plays softly after guests tap Open, and guests can mute it at any time. Every track is public domain or CC0, so it is free to share anywhere.
        {!draft.settings.openingCover && selected ? " Your opening card is off, so guests start the music with the button in the corner." : ""}
      </p>

      <fieldset className="grid gap-4">
        <legend className="sr-only">Background music</legend>
        <Option checked={!selected} onSelect={() => setSettings({ musicTrack: "" })} label="No music">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-fill text-muted-foreground">
            <VolumeXIcon className="size-4" />
          </span>
        </Option>

        {MOODS.map((mood) => (
          <div key={mood} className="grid gap-1">
            <h3 className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{MOOD_LABEL[mood]}</h3>
            {ordered(mood).map((track) => {
              const playing = preview.current === track.id;
              return (
                <Option
                  key={track.id}
                  checked={selected === track.id}
                  onSelect={() => setSettings({ musicTrack: track.id })}
                  label={track.title}
                  sub={`${track.composer} · ${track.performer} · ${formatDuration(track.duration)}${suggested.includes(track.id) ? " · Suggested" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => preview.toggle(track)}
                    aria-label={`${playing ? "Stop" : "Preview"} ${track.title}`}
                    aria-pressed={playing}
                    data-testid={`music-preview-${track.id}`}
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      playing ? "bg-primary text-primary-foreground" : "bg-fill text-foreground hover:bg-fill-hover",
                    )}
                  >
                    {playing ? <PauseIcon className="size-4" aria-hidden /> : <PlayIcon className="ml-0.5 size-4" aria-hidden />}
                  </button>
                </Option>
              );
            })}
          </div>
        ))}
      </fieldset>
    </div>
  );
}

"use client";

import { MusicIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface MusicData {
  src: string;
  title: string;
  credit: string;
}

/** Comfortable background level; the files are loudness-matched, so one value suits all. */
const VOLUME = 0.55;

/**
 * Looping background music for the guest page. Browsers only allow sound after
 * a user gesture, so `play()` must be called from one (the opening card's Open
 * button, or the music button). Fades in and out, pauses while the tab is
 * hidden, and stays paused once the guest mutes it. The file loads on first play.
 */
export function useBackgroundMusic(music: MusicData | null) {
  const audio = useRef<HTMLAudioElement | null>(null);
  const frame = useRef(0);
  const resumeOnShow = useRef(false);
  const [playing, setPlaying] = useState(false);

  const element = useCallback(() => {
    if (!music) return null;
    if (!audio.current) {
      const el = new Audio(music.src);
      el.loop = true;
      el.preload = "auto";
      el.volume = 0;
      el.addEventListener("play", () => setPlaying(true));
      el.addEventListener("pause", () => setPlaying(false));
      audio.current = el;
    }
    return audio.current;
  }, [music]);

  const fadeTo = useCallback((el: HTMLAudioElement, target: number, ms: number, done?: () => void) => {
    cancelAnimationFrame(frame.current);
    const from = el.volume;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      el.volume = from + (target - from) * t;
      if (t < 1) frame.current = requestAnimationFrame(step);
      else done?.();
    };
    frame.current = requestAnimationFrame(step);
  }, []);

  const play = useCallback(() => {
    const el = element();
    if (!el) return;
    el.volume = 0;
    // Rejected when there was no user gesture (e.g. Escape); the button stays available.
    el.play().then(() => fadeTo(el, VOLUME, 2000), () => undefined);
  }, [element, fadeTo]);

  const pause = useCallback(() => {
    const el = audio.current;
    if (!el || el.paused) return;
    fadeTo(el, 0, 350, () => el.pause());
  }, [fadeTo]);

  const toggle = useCallback(() => (audio.current && !audio.current.paused ? pause() : play()), [pause, play]);

  // Silence while the guest is in another tab or app; pick up again when they return.
  useEffect(() => {
    const onVisibility = () => {
      const el = audio.current;
      if (!el) return;
      if (document.hidden) {
        resumeOnShow.current = !el.paused;
        el.pause();
      } else if (resumeOnShow.current) {
        resumeOnShow.current = false;
        void el.play().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      audio.current?.pause();
      audio.current = null;
    },
    [],
  );

  return { playing, play, toggle };
}

/** Round toggle in the top-right corner; animated bars while music plays. */
export function MusicButton({ music, playing, onToggle }: { music: MusicData; playing: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={playing}
      aria-label="Background music"
      title={`${playing ? "Pause" : "Play"} music: ${music.title} (${music.credit})`}
      data-inv-music
      className="fixed top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-[61] grid size-11 place-items-center rounded-full text-(--inv-bg) shadow-[0_12px_30px_-12px_rgb(0_0_0/0.5)] ring-1 ring-(--inv-bg)/10 backdrop-blur-md transition-transform duration-300 animate-fade-in hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--inv-text)"
      style={{ background: "color-mix(in oklab, var(--inv-text) 86%, transparent)" }}
    >
      {playing ? (
        <span aria-hidden className="flex h-4 items-end gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[3px] origin-bottom rounded-full bg-current motion-safe:animate-[music-bar_0.9s_ease-in-out_infinite]"
              style={{ height: "100%", animationDelay: `${i * -0.22}s`, transform: `scaleY(${[0.5, 0.9, 0.65, 0.8][i]})` }}
            />
          ))}
        </span>
      ) : (
        <span aria-hidden className="relative">
          <MusicIcon className="size-[1.1rem]" />
          <span className="absolute top-1/2 left-1/2 h-[1.6rem] w-[2px] -translate-1/2 -rotate-45 rounded-full bg-current" />
        </span>
      )}
    </button>
  );
}

"use client";

import { CalendarPlusIcon, CheckIcon, MailCheckIcon, NavigationIcon, Share2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { shareInvitation, type ShareData } from "@/features/templates/sections/share";

export interface DockData {
  directionsUrl: string;
  calendarUrl: string;
  /** Section id to jump to for RSVP, or "" when RSVP is off. */
  rsvpTarget: string;
  share: ShareData;
}

const item =
  "flex min-h-12 min-w-14 flex-col items-center justify-center gap-0.5 rounded-full px-3 text-[0.65rem] font-medium tracking-wide transition-colors hover:bg-(--inv-bg)/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--inv-bg)";

/**
 * Floating quick actions for guests (directions, calendar, RSVP, share).
 * Appears once the guest scrolls past the opening screen.
 */
export function ActionDock({ directionsUrl, calendarUrl, rsvpTarget, share }: DockData) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > window.innerHeight * 0.45);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const onShare = async () => {
    if ((await shareInvitation(share)) === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <nav
      aria-label="Quick actions"
      data-inv-dock
      className={cn(
        "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-0.5 rounded-full p-1.5 text-(--inv-bg) shadow-[0_18px_40px_-16px_rgb(0_0_0/0.5)] ring-1 ring-(--inv-bg)/10 backdrop-blur-md transition-[translate,opacity] duration-500 ease-(--ease-out-quart)",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[160%] opacity-0",
      )}
      style={{ background: "color-mix(in oklab, var(--inv-text) 86%, transparent)" }}
      inert={!visible}
    >
      {directionsUrl ? (
        <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className={item}>
          <NavigationIcon className="size-4" aria-hidden /> Directions
        </a>
      ) : null}
      {calendarUrl ? (
        <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className={item}>
          <CalendarPlusIcon className="size-4" aria-hidden /> Calendar
        </a>
      ) : null}
      {rsvpTarget ? (
        <a href={`#${rsvpTarget}`} className={item}>
          <MailCheckIcon className="size-4" aria-hidden /> RSVP
        </a>
      ) : null}
      <button type="button" onClick={onShare} className={item}>
        {copied ? <CheckIcon className="size-4" aria-hidden /> : <Share2Icon className="size-4" aria-hidden />}
        <span aria-live="polite">{copied ? "Copied" : "Share"}</span>
      </button>
    </nav>
  );
}

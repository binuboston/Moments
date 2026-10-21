"use client";

import { useEffect, useRef, useState } from "react";
import { SmoothScroll, useLenis } from "@/components/motion/smooth-scroll";
import { ActionDock, type DockData } from "@/features/templates/motion/action-dock";
import { MusicButton, useBackgroundMusic, type MusicData } from "@/features/templates/motion/background-music";
import { burst, type ParticleKind } from "@/features/templates/motion/burst";
import { OpeningCover, type CoverData } from "@/features/templates/motion/opening-cover";
import { useInvitationMotion } from "@/features/templates/motion/use-invitation-motion";

interface InvitationExperienceProps {
  /** null when the owner turned the opening card off. */
  cover: CoverData | null;
  dock: DockData;
  /** null when the owner chose no music. */
  music: MusicData | null;
  particles: ParticleKind;
  children: React.ReactNode;
}

type Phase = "closed" | "revealing" | "open";

/**
 * The guest-facing layer around a template on the public page and live demo:
 * Lenis smooth scrolling, the opening card, scroll-driven motion and the
 * quick-action dock. Previews (editor, catalogue) never use it, so they stay
 * static and cheap.
 */
export function InvitationExperience(props: InvitationExperienceProps) {
  return (
    <SmoothScroll>
      <Experience {...props} />
    </SmoothScroll>
  );
}

function Experience({ cover, dock, music, particles, children }: InvitationExperienceProps) {
  const lenis = useLenis();
  const [phase, setPhase] = useState<Phase>(cover ? "closed" : "open");
  const content = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const sound = useBackgroundMusic(music);

  useInvitationMotion(content, phase !== "closed");

  // Deep links (e.g. /e/slug#rsvp) go straight to the content.
  useEffect(() => {
    // Reading location is only possible after mount; this runs once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.location.hash) setPhase((p) => (p === "closed" ? "open" : p));
  }, []);

  // While the opening card is shown the page behind it cannot scroll or take focus.
  useEffect(() => {
    if (phase !== "closed") return;
    const html = document.documentElement;
    const el = content.current;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    lenis?.stop();
    if (el) el.inert = true;
    return () => {
      html.style.overflow = previous;
      lenis?.start();
      if (el) el.inert = false;
    };
  }, [phase, lenis]);

  return (
    <>
      {/* Without JavaScript the opening card could never open, so it is not shown at all. */}
      <noscript dangerouslySetInnerHTML={{ __html: "<style>[data-inv-cover]{display:none!important}</style>" }} />
      {cover && phase !== "open" ? (
        <OpeningCover
          {...cover}
          particles={particles}
          onBurst={(x, y) => layer.current && burst(layer.current, particles, x, y)}
          onOpen={sound.play}
          onReveal={() => setPhase("revealing")}
          onDone={() => {
            setPhase("open");
            content.current?.focus({ preventScroll: true });
          }}
        />
      ) : null}
      <div ref={content} tabIndex={-1} className="pb-24 outline-none">
        {children}
      </div>
      <div ref={layer} aria-hidden className="pointer-events-none fixed inset-0 z-[72] overflow-hidden" />
      {phase !== "closed" ? <ActionDock {...dock} /> : null}
      {music && phase !== "closed" ? <MusicButton music={music} playing={sound.playing} onToggle={sound.toggle} /> : null}
    </>
  );
}

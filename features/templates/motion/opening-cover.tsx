"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion/gsap";

export interface CoverData {
  monogram: string;
  eyebrow: string;
  title: string;
  date: string;
  invocation: string;
}

interface OpeningCoverProps extends CoverData {
  /** Fired as the cover starts to fade, so the hero can animate in underneath. */
  onReveal: () => void;
  /** Fired when the cover has gone and can unmount. */
  onDone: () => void;
  /** Viewport point the celebration burst starts from (the wax seal). */
  onBurst: (x: number, y: number) => void;
}

/**
 * Sealed-envelope opening screen. Styled entirely with the template's theme
 * variables so every design gets its own version. The guest opens it with the
 * button, Enter/Space on the button, or Escape. Without JavaScript a <noscript>
 * rule hides it (see InvitationExperience).
 */
export function OpeningCover({ monogram, eyebrow, title, date, invocation, onReveal, onDone, onBurst }: OpeningCoverProps) {
  const root = useRef<HTMLDivElement>(null);
  const opening = useRef(false);

  const timeline = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      root.current?.querySelectorAll("[data-cover-in]").forEach((el) => el.setAttribute("data-reveal-bound", ""));
      // Opacity only (not autoAlpha): the button must stay focusable while it fades in.
      gsap.fromTo("[data-cover-in]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, delay: 0.1 });
      gsap.to("[data-seal]", { scale: 1.05, duration: 1.4, ease: "sine.inOut", repeat: -1, yoyo: true });
    },
    { scope: root },
  );

  // Event handler (not render-time), so reading refs here is fine.
  function open() {
    if (opening.current) return;
    opening.current = true;
    const el = root.current!;
    const q = gsap.utils.selector(el);

    if (prefersReducedMotion()) {
      onReveal();
      gsap.to(el, { autoAlpha: 0, duration: 0.25, onComplete: onDone });
      return;
    }

    const seal = q("[data-seal]")[0] as HTMLElement;
    const rect = seal.getBoundingClientRect();
    gsap.killTweensOf(seal);
    timeline.current = gsap
      .timeline()
      .to(seal, { scale: 1.18, duration: 0.16, ease: "power2.out" })
      .to(seal, { scale: 0, rotate: -30, autoAlpha: 0, duration: 0.38, ease: "back.in(2.2)" })
      .add(() => onBurst(rect.left + rect.width / 2, rect.top + rect.height / 2), "<0.2")
      .to(q("[data-flap]"), { rotateX: 180, duration: 0.75, ease: "power3.inOut" }, "<0.05")
      .set(q("[data-flap]"), { zIndex: 5 }, "<0.36")
      .to(q("[data-letter]"), { yPercent: -48, duration: 0.85, ease: "power3.out" }, "-=0.25")
      .to(q("[data-cover-ui]"), { autoAlpha: 0, y: 12, duration: 0.4, ease: "power2.in" }, "<")
      .add(onReveal, "+=0.1")
      .to(el, { autoAlpha: 0, scale: 1.04, duration: 0.7, ease: "power2.inOut" }, "<")
      .add(onDone);
  }

  const openRef = useRef(open);
  useEffect(() => {
    openRef.current = open;
  });
  useEffect(() => () => void timeline.current?.kill(), []);

  // Keyboard: Enter or Space on the button opens it natively. Escape opens it from
  // anywhere, and Enter/Space do too while nothing else has focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const idle = document.activeElement === document.body || document.activeElement === null;
      if (e.key === "Escape" || (idle && (e.key === "Enter" || e.key === " "))) {
        e.preventDefault();
        openRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Paper tones are tinted with the accent so they suit light and dark palettes alike.
  const paper = "color-mix(in oklab, var(--inv-surface) 90%, var(--inv-accent))";
  const pocket = "color-mix(in oklab, var(--inv-surface) 84%, var(--inv-accent))";
  const flap = "color-mix(in oklab, var(--inv-surface) 78%, var(--inv-accent))";

  return (
    <div
      ref={root}
      data-inv-cover
      role="dialog"
      aria-modal="true"
      aria-labelledby="inv-cover-title"
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden bg-(--inv-bg) text-(--inv-text)"
    >
      {/* Arched frame, echoing a temple doorway or a window. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-4 top-5 bottom-5 mx-auto max-w-md rounded-t-full border border-(--inv-accent)/35" data-cover-in />
      <div aria-hidden className="pointer-events-none absolute inset-x-6 top-7 bottom-7 mx-auto max-w-[27rem] rounded-t-full border border-(--inv-accent)/15" data-cover-in />

      <div className="relative flex w-full max-w-sm flex-col items-center px-8 text-center">
        <div data-cover-ui className="flex flex-col items-center">
          <p className="text-[0.7rem] tracking-[0.3em] uppercase text-(--inv-accent)" data-cover-in>
            {invocation || eyebrow}
          </p>
          <p id="inv-cover-title" className="inv-display mt-4 text-3xl leading-tight text-balance sm:text-4xl" data-cover-in>
            {title}
          </p>
        </div>

        <div className="relative mt-10 aspect-[10/7] w-[min(19rem,76vw)] [perspective:1200px]" data-cover-in aria-hidden>
          <div className="absolute inset-0 rounded-md shadow-[0_40px_70px_-35px_rgb(0_0_0/0.55)] ring-1 ring-(--inv-border)" style={{ background: paper }} />
          <div data-letter className="absolute inset-x-[7%] top-[6%] bottom-[8%] z-10 flex flex-col items-center rounded-sm bg-(--inv-bg) pt-[9%] ring-1 ring-(--inv-border)">
            <span className="inv-display text-xl text-(--inv-accent)">{monogram}</span>
            <span className="mt-2 h-px w-10 bg-(--inv-accent)/50" />
            <span className="mt-2 text-[0.55rem] tracking-[0.28em] uppercase text-(--inv-muted)">{date}</span>
          </div>
          {/* Front pocket: side and bottom flaps, open only under the top flap. */}
          <div className="absolute inset-0 z-20 rounded-md" style={{ background: pocket, clipPath: "polygon(0 0, 50% 66%, 100% 0, 100% 100%, 0 100%)" }} />
          <svg viewBox="0 0 100 70" preserveAspectRatio="none" className="absolute inset-0 z-20 size-full text-(--inv-accent)" fill="none" stroke="currentColor" strokeWidth="0.35" vectorEffect="non-scaling-stroke">
            <path d="M0 0 L50 46.2 L100 0" opacity="0.35" />
            <path d="M0 70 L42 40 M100 70 L58 40" opacity="0.3" />
            <path d="M0 66 H100" opacity="0.8" />
            <path d="M0 67.6 H100" opacity="0.4" />
          </svg>
          <div
            data-flap
            className="absolute inset-x-0 top-0 z-30 h-[66%] origin-top"
            style={{ background: flap, clipPath: "polygon(0 0, 100% 0, 50% 100%)", transformStyle: "preserve-3d" }}
          />
          <div
            data-seal
            className="absolute top-[66%] left-1/2 z-40 flex size-[4.25rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-(--inv-accent-contrast) shadow-[0_8px_20px_-6px_rgb(0_0_0/0.45),inset_0_2px_4px_rgb(255_255_255/0.35),inset_0_-3px_6px_rgb(0_0_0/0.25)]"
            style={{ background: "radial-gradient(circle at 35% 30%, color-mix(in oklab, var(--inv-accent) 65%, white), var(--inv-accent) 62%, color-mix(in oklab, var(--inv-accent) 80%, black))" }}
          >
            <span className="flex size-[3.25rem] items-center justify-center rounded-full border border-current/40">
              <span className="inv-display text-lg italic">{monogram}</span>
            </span>
          </div>
        </div>

        <div data-cover-ui className="flex flex-col items-center">
          <p className="mt-9 text-[0.7rem] tracking-[0.3em] uppercase text-(--inv-muted)" data-cover-in>
            {date}
          </p>
          <button
            type="button"
            onClick={open}
            data-cover-in
            className="mt-6 inline-flex min-h-12 items-center rounded-full bg-(--inv-accent) px-8 text-sm font-semibold tracking-[0.22em] uppercase text-(--inv-accent-contrast) shadow-[0_14px_34px_-14px_var(--inv-accent)] transition-transform hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--inv-accent)"
          >
            Tap to open
          </button>
        </div>
      </div>
    </div>
  );
}

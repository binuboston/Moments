"use client";

import { HeartIcon, SparklesIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion/gsap";
import { blossomSvg, type ParticleKind } from "@/features/templates/motion/burst";

export interface CoverData {
  /** One line per name; couples get two lines joined by an ampersand. */
  names: string[];
  date: string;
  invocation: string;
  /** Heart for love and family occasions, sparkle for everything else. */
  icon: "heart" | "sparkle";
}

interface OpeningCoverProps extends CoverData {
  particles: ParticleKind;
  /** Fired as the card lifts away, so the hero can animate in underneath. */
  onReveal: () => void;
  /** Fired when the cover has gone and can unmount. */
  onDone: () => void;
  /** Viewport point the blossom burst starts from (the card's centre). */
  onBurst: (x: number, y: number) => void;
}

/** Small drifting blossoms in the backdrop (positions in %, size in rem). */
const AMBIENT = [
  { x: 12, y: 14, s: 1.1 },
  { x: 82, y: 9, s: 0.9 },
  { x: 90, y: 42, s: 1.2 },
  { x: 6, y: 58, s: 0.8 },
  { x: 74, y: 78, s: 1 },
  { x: 24, y: 88, s: 1.2 },
  { x: 50, y: 4, s: 0.7 },
  { x: 40, y: 95, s: 0.8 },
];

/** Reads ?guest=Name so hosts can share personalised links. Plain text, length-capped. */
function useGuestName() {
  const [guest, setGuest] = useState("");
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("guest") ?? "";
    // Only available after mount (the page itself is cached for every guest).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuest(raw.replace(/\s+/g, " ").trim().slice(0, 60));
  }, []);
  return guest;
}

/**
 * Opening screen: a single invitation card over a blurred, tinted backdrop
 * with corner blooms and an Open button. Opening ripples the badge, sweeps a
 * shine across the button, blooms the corners outwards, bursts blossoms from
 * the card and lifts it away to reveal the invitation. Styled entirely with
 * the template's theme variables. Keyboard: the button, Enter/Space while
 * nothing else has focus, or Escape. Without JavaScript a <noscript> rule
 * hides it (see InvitationExperience).
 */
export function OpeningCover({ names, date, invocation, icon, particles, onReveal, onDone, onBurst }: OpeningCoverProps) {
  const root = useRef<HTMLDivElement>(null);
  const opening = useRef(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const guest = useGuestName();
  const Icon = icon === "heart" ? HeartIcon : SparklesIcon;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      q("[data-cover-in]").forEach((el) => el.setAttribute("data-reveal-bound", ""));
      // Opacity only (not autoAlpha): the button must stay focusable while it fades in.
      gsap
        .timeline({ delay: 0.1 })
        .fromTo(q("[data-cover-card]"), { opacity: 0, y: 48, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "expo.out" })
        .fromTo(q("[data-bloom]"), { scale: 0, opacity: 0, transformOrigin: "0% 0%" }, { scale: 1, opacity: 1, duration: 1.2, ease: "back.out(1.4)", stagger: 0.12 }, 0.25)
        .fromTo(q("[data-badge]"), { scale: 0 }, { scale: 1, duration: 0.8, ease: "back.out(2)" }, 0.3)
        .fromTo(q("[data-cover-line]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }, 0.35);
      q("[data-ambient]").forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 0.55, duration: 1.2, delay: 0.4 + i * 0.08 });
        gsap.to(el, { y: gsap.utils.random(-26, -12), x: gsap.utils.random(-10, 10), rotate: gsap.utils.random(-50, 50), duration: gsap.utils.random(3, 5), ease: "sine.inOut", repeat: -1, yoyo: true });
      });
      // A slow glint on the button invites the tap.
      gsap.fromTo(q("[data-shine]"), { xPercent: -160 }, { xPercent: 360, duration: 1.1, ease: "power2.inOut", repeat: -1, repeatDelay: 2.4, delay: 1.6 });
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

    const card = q("[data-cover-card]")[0] as HTMLElement;
    const rect = card.getBoundingClientRect();
    gsap.killTweensOf(q("[data-shine], [data-ambient]"));
    timeline.current = gsap
      .timeline()
      .to(q("[data-badge]"), { scale: 1.18, duration: 0.16, ease: "power2.out" }, 0)
      .to(q("[data-badge]"), { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }, 0.16)
      .fromTo(q("[data-ripple]"), { scale: 1, opacity: 0.7 }, { scale: 2.8, opacity: 0, duration: 0.75, ease: "power2.out" }, 0)
      .fromTo(q("[data-shine]"), { xPercent: -160 }, { xPercent: 360, duration: 0.5, ease: "power2.inOut" }, 0)
      .to(q("[data-bloom]"), { scale: 1.8, opacity: 0, filter: "blur(6px)", duration: 0.8, ease: "power2.out" }, 0.05)
      .add(() => onBurst(rect.left + rect.width / 2, rect.top + rect.height * 0.55), 0.14)
      .add(onReveal, 0.32)
      .to(card, { yPercent: -135, rotate: -2.5, opacity: 0.3, duration: 0.8, ease: "power3.in" }, 0.28)
      .to(q("[data-cover-backdrop], [data-ambient]"), { opacity: 0, duration: 0.75, ease: "power2.inOut" }, 0.45)
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

  const backdrop =
    "linear-gradient(160deg, color-mix(in oklab, var(--inv-deep) 88%, var(--inv-accent)) 0%, color-mix(in oklab, var(--inv-deep) 72%, var(--inv-accent)) 55%, color-mix(in oklab, var(--inv-deep) 50%, var(--inv-accent)) 100%)";

  return (
    <div ref={root} data-inv-cover role="dialog" aria-modal="true" aria-labelledby="inv-cover-title" className="fixed inset-0 z-[70] flex items-center justify-center overflow-hidden px-6 py-10">
      <div data-cover-backdrop aria-hidden className="absolute inset-0 backdrop-blur-xl" style={{ background: backdrop }} />
      {AMBIENT.map((a, i) => (
        <span
          key={i}
          data-ambient
          aria-hidden
          className="pointer-events-none absolute opacity-0"
          style={{ left: `${a.x}%`, top: `${a.y}%`, width: `${a.s}rem`, height: `${a.s}rem`, color: i % 2 ? "color-mix(in oklab, var(--inv-accent) 40%, white)" : "color-mix(in oklab, var(--inv-accent) 50%, #f48fb1)" }}
          dangerouslySetInnerHTML={{ __html: blossomSvg("rgb(255 255 255 / 0.6)") }}
        />
      ))}

      <div
        data-cover-card
        data-cover-in
        className="relative w-full max-w-[20rem] rounded-2xl bg-(--inv-bg) px-7 pt-9 pb-10 text-center text-(--inv-text) shadow-[0_40px_90px_-30px_rgb(0_0_0/0.7)] ring-1 ring-(--inv-accent)/20"
      >
        <span aria-hidden className="pointer-events-none absolute -top-5 -left-5">
          <CornerBloom kind={particles} />
        </span>
        {/* Flipped on a wrapper so GSAP's transform origin on the SVG stays in its own corner. */}
        <span aria-hidden className="pointer-events-none absolute -right-5 -bottom-5 -scale-100">
          <CornerBloom kind={particles} />
        </span>

        <div data-badge className="relative mx-auto flex size-14 items-center justify-center rounded-full bg-(--inv-accent) text-(--inv-accent-contrast) shadow-[0_10px_24px_-8px_var(--inv-accent)]">
          <span data-ripple aria-hidden className="absolute inset-0 rounded-full border-2 border-(--inv-accent) opacity-0" />
          <Icon className="size-6 fill-current" aria-hidden />
        </div>

        {invocation ? (
          <p data-cover-line className="mt-5 text-xs tracking-wide text-(--inv-accent)">
            {invocation}
          </p>
        ) : null}
        <h2 id="inv-cover-title" data-cover-line className="inv-display mt-5 text-3xl leading-tight text-balance text-(--inv-accent)">
          {names.map((name, i) => (
            <span key={i} className="block">
              {i > 0 ? <span className="block py-0.5 text-xl opacity-80">&amp;</span> : null}
              {name}
            </span>
          ))}
        </h2>
        <div data-cover-line aria-hidden className="mx-auto mt-4 flex items-center justify-center gap-2 text-(--inv-accent)">
          <span className="h-px w-12 bg-current opacity-40" />
          <span className="size-3" dangerouslySetInnerHTML={{ __html: blossomSvg("var(--inv-bg)") }} />
          <span className="h-px w-12 bg-current opacity-40" />
        </div>
        <p data-cover-line className="mt-3 text-lg">
          {date}
        </p>
        <p data-cover-line className="mt-5 text-(--inv-muted)">
          Cordially invites {guest ? "" : "you"}
        </p>
        {guest ? (
          <p data-cover-line className="mx-auto mt-2 w-fit max-w-full rounded-lg bg-(--inv-accent)/12 px-5 py-2 font-semibold break-words text-(--inv-accent)">
            {guest}
          </p>
        ) : null}
        <p data-cover-line className="mt-2 text-sm text-(--inv-muted)">
          to celebrate with us
        </p>

        <div data-cover-line>
          <button
            type="button"
            onClick={open}
            className="relative mt-7 inline-flex min-h-12 items-center overflow-hidden rounded-full bg-(--inv-accent) px-10 text-base font-semibold text-(--inv-accent-contrast) shadow-[0_14px_30px_-12px_var(--inv-accent)] transition-transform hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--inv-accent)"
          >
            <span data-shine aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            <span className="relative">Open</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** A spray of blossoms and leaves anchored in the top-left corner (flip it for other corners). */
function CornerBloom({ kind }: { kind: ParticleKind }) {
  const flower = kind === "petals" ? "color-mix(in oklab, var(--inv-accent) 40%, #d81b60)" : "var(--inv-accent)";
  const soft = kind === "petals" ? "color-mix(in oklab, var(--inv-accent) 30%, #f48fb1)" : "color-mix(in oklab, var(--inv-accent) 55%, white)";
  const leaf = "color-mix(in oklab, var(--inv-accent) 35%, #4e6b3c)";
  const blooms = [
    { x: 14, y: 14, r: 10, c: flower },
    { x: 32, y: 9, r: 7, c: soft },
    { x: 9, y: 33, r: 7.5, c: soft },
    { x: 30, y: 28, r: 6, c: flower },
    { x: 50, y: 7, r: 5.5, c: flower },
    { x: 7, y: 52, r: 5.5, c: flower },
    { x: 46, y: 20, r: 4.2, c: soft },
    { x: 20, y: 46, r: 4.2, c: soft },
    { x: 66, y: 12, r: 3.6, c: soft },
    { x: 12, y: 68, r: 3.6, c: soft },
    { x: 40, y: 38, r: 3.4, c: flower },
    { x: 78, y: 5, r: 2.8, c: flower },
    { x: 5, y: 80, r: 2.8, c: flower },
    { x: 22, y: 22, r: 3, c: soft },
  ];  return (
    <svg data-bloom viewBox="0 0 96 96" className="block size-32 sm:size-36" aria-hidden>
      <g fill="none" stroke={leaf} strokeWidth="1.4" strokeLinecap="round">
        <path d="M6 6 C 30 12, 52 6, 88 4" />
        <path d="M6 6 C 12 30, 6 52, 4 88" />
        <path d="M14 14 C 30 24, 40 34, 46 46" />
      </g>
      <g fill={leaf}>
        <ellipse cx="66" cy="8" rx="6" ry="2.4" transform="rotate(-12 66 8)" />
        <ellipse cx="8" cy="68" rx="2.4" ry="6" transform="rotate(12 8 68)" />
        <ellipse cx="44" cy="4" rx="5" ry="2" transform="rotate(14 44 4)" />
        <ellipse cx="4" cy="44" rx="2" ry="5" transform="rotate(-14 4 44)" />
        <ellipse cx="58" cy="14" rx="4.5" ry="1.8" transform="rotate(24 58 14)" />
        <ellipse cx="14" cy="58" rx="1.8" ry="4.5" transform="rotate(-24 14 58)" />
        <ellipse cx="36" cy="44" rx="4" ry="1.7" transform="rotate(48 36 44)" />
      </g>
      {blooms.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.r / 6})`} fill={b.c}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="0" cy="-3.4" rx="1.7" ry="3.2" transform={`rotate(${a})`} />
          ))}
          <circle r="1.3" fill="rgb(255 255 255 / 0.85)" />
        </g>
      ))}
    </svg>
  );
}

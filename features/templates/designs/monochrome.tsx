import { formatEventDate } from "@/lib/utils/dates";
import { defineTemplate } from "@/features/templates/compose/define";
import { MonoCover } from "@/features/templates/compose/frames";
import { PosterHero } from "@/features/templates/compose/heroes/poster";
import { daisy } from "@/features/templates/palettes";
import { titleParts } from "@/features/templates/title";

export const monochrome = defineTemplate({
  key: "monochrome",
  name: "Monochrome",
  description: "A typographic poster: giant date numerals, heavy black type, black-and-white photography and one bold accent.",
  categories: ["birthday", "party", "corporate", "engagement", "wedding", "anniversary", "housewarming"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "message"],
  palettes: [
    { id: "paper-red", name: "Paper & red", vars: { bg: "#f4f1ea", surface: "#fbf9f4", text: "#111111", muted: "#555049", accent: "#c1121f", accentContrast: "#ffffff", border: "#d9d4c9" }, swatch: ["#f4f1ea", "#c1121f", "#111111"] },
    ...daisy("lofi", "black", "silk", "wireframe", "dim"),
  ],
  fontPairings: [
    { id: "archivo-manrope", name: "Archivo & Manrope", display: "archivo", body: "manrope" },
    { id: "archivo-dm", name: "Archivo & DM Sans", display: "archivo", body: "dm-sans" },
    { id: "fraunces-archivo", name: "Fraunces & Archivo", display: "fraunces", body: "archivo" },
  ],
  defaults: { paletteId: "paper-red", fontPairingId: "archivo-manrope" },
  previewGradient: "linear-gradient(135deg, #f4f1ea 0%, #f4f1ea 60%, #111111 60%, #111111 100%)",
  particles: "sparkles",
  motion: "editorial",
  card: { align: "left", titleWeight: 900, titleUppercase: true, titleTracking: -0.04, eyebrow: "spaced", frame: "none" },
  recipe: {
    Hero: PosterHero,
    Cover: MonoCover,
    chapter: {
      frame: "headed",
      align: "left",
      numbered: true,
      className: "border-t-2 border-(--inv-text)",
      countdownClassName: "border-t-2 border-(--inv-text)",
      titleClassName: "font-black uppercase tracking-[-0.03em] sm:text-6xl",
      eyebrowClassName: "font-bold tracking-[0.24em]",
    },
    copy: {
      details: { eyebrow: "Where & when", title: "The details" },
      schedule: { eyebrow: "Running order", title: "Schedule" },
      gallery: { eyebrow: "Pictures", title: "Gallery" },
      rsvp: { eyebrow: "Reply", title: "RSVP" },
      gifts: { eyebrow: "Gifts" },
      contacts: { eyebrow: "Questions", title: "Contact" },
    },
    intro: {
      hosts: { className: "mb-4 text-xs font-bold tracking-[0.2em] uppercase text-(--inv-muted)", reveal: true },
      textClassName: "inv-display max-w-2xl text-2xl leading-snug font-bold tracking-tight text-pretty sm:text-3xl",
      lines: { as: "ul", className: "mt-8 space-y-1 border-l-4 border-(--inv-accent) pl-4 text-sm font-semibold" },
    },
    countdown: {
      saveTheDate: { align: "left", titleClassName: "font-black uppercase tracking-[-0.03em]", cardClassName: "rounded-none border-2 border-(--inv-text) shadow-none" },
      between: (
        <p className="mt-16 mb-6 text-[0.7rem] font-bold tracking-[0.24em] uppercase" data-inv-reveal>
          Countdown
        </p>
      ),
      countdown: { className: "max-w-lg", cellClassName: "rounded-none border-0 border-l-2 border-(--inv-text) bg-transparent text-left", numberClassName: "font-black tracking-tight" },
    },
    details: {
      panel: { className: "border-2 border-(--inv-text) p-6 sm:p-8", reveal: true },
      event: { showIcons: false, itemClassName: "items-start text-left" },
      dressCode: { format: (v) => `Dress code — ${v}`, className: "mt-6 text-xs font-bold tracking-[0.18em] uppercase text-(--inv-muted)" },
      calendar: { className: "mt-6 justify-start", buttonClassName: "rounded-none border-2 border-(--inv-text) font-bold uppercase tracking-[0.1em] text-xs" },
    },
    schedule: { className: "mx-0" },
    gallery: { rounded: "rounded-none" },
    rsvp: { className: "mx-0" },
    gifts: { className: "mx-0 text-left [&>svg]:mx-0" },
    contacts: { className: "mx-0 max-w-none" },
    closing: { align: "left", className: "bg-(--inv-text) py-20 text-(--inv-bg) sm:py-28", textClassName: "inv-display max-w-2xl text-4xl leading-[1.02] font-black tracking-[-0.03em] uppercase text-pretty sm:text-5xl" },
    share: { className: "items-start px-6 py-16 text-left sm:px-10 sm:py-20" },
    Tail: ({ view, share, branding }) => (
      <>
        {share}
        <footer className="mx-6 flex items-center justify-between border-t-2 border-(--inv-text) py-5 text-[0.65rem] font-bold tracking-[0.22em] uppercase sm:mx-10">
          <span>{titleParts(view.content).title}</span>
          <span className="text-(--inv-accent)">{formatEventDate(view.content.startsAt, view.content.timezone)}</span>
        </footer>
        {branding}
      </>
    ),
  },
});

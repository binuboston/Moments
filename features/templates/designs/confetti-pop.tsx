import { ConfettiLayer, StickerCover } from "@/features/templates/compose/frames";
import { StickerHero } from "@/features/templates/compose/heroes/sticker";
import { defineTemplate } from "@/features/templates/compose/define";
import { daisy } from "@/features/templates/palettes";

export const confettiPop = defineTemplate({
  key: "confetti-pop",
  name: "Confetti Pop",
  description: "Bright, joyful and playful with floating confetti. Made for birthdays, showers and parties.",
  categories: ["birthday", "baby-shower", "party"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "gallery", "rsvp", "contacts", "message"],
  palettes: [
    { id: "candy", name: "Candy", vars: { bg: "#fff8f0", surface: "#ffffff", text: "#1f1b2e", muted: "#6c6680", accent: "#f45985", accentContrast: "#111111", border: "#f3e3e8" }, swatch: ["#fff8f0", "#f45985", "#ffd166"] },
    { id: "citrus", name: "Citrus", vars: { bg: "#fffdf2", surface: "#ffffff", text: "#1e2a1e", muted: "#6b7566", accent: "#c6840f", accentContrast: "#1e2a1e", border: "#f0ead6" }, swatch: ["#fffdf2", "#c6840f", "#84cc16"] },
    { id: "ocean", name: "Ocean", vars: { bg: "#f0f9ff", surface: "#ffffff", text: "#0c1f33", muted: "#5a7088", accent: "#0e98d7", accentContrast: "#111111", border: "#dbeafe" }, swatch: ["#f0f9ff", "#0e98d7", "#f472b6"] },
    { id: "berry", name: "Berry", vars: { bg: "#fdf4ff", surface: "#ffffff", text: "#2a1033", muted: "#7a5a85", accent: "#a855f7", accentContrast: "#111111", border: "#f0dcf6" }, swatch: ["#fdf4ff", "#a855f7", "#fb7185"] },
    ...daisy("valentine", "retro"),
  ],
  fontPairings: [
    { id: "poppins", name: "Poppins", display: "poppins", body: "dm-sans" },
    { id: "fraunces-poppins", name: "Fraunces & Poppins", display: "fraunces", body: "poppins" },
  ],
  defaults: { paletteId: "candy", fontPairingId: "poppins" },
  previewGradient: "linear-gradient(135deg, #fff8f0 0%, #ffe3ec 60%, #fff1c6 100%)",
  particles: "confetti",
  motion: "playful",
  recipe: {
    Hero: StickerHero,
    Cover: StickerCover,
    chapter: { frame: "headed", eyebrowClassName: "text-(--inv-text)" },
    copy: {
      details: { eyebrow: "Where to find us", title: "The details" },
      schedule: { eyebrow: "Plan", title: "What's happening" },
      gallery: { eyebrow: "Photos", title: "Memories" },
      rsvp: { eyebrow: "Are you in?", title: "RSVP" },
      gifts: { eyebrow: "Gifts" },
      contacts: { eyebrow: "Questions?", title: "Say hello" },
    },
    intro: {
      hosts: { className: "mb-3 text-sm font-semibold text-(--inv-muted)", reveal: true },
      textClassName: "mx-auto max-w-xl text-lg leading-relaxed text-pretty sm:text-xl",
      lines: { as: "p", className: "mt-4 text-sm text-(--inv-muted)" },
    },
    countdown: {
      saveTheDate: { title: "Save the date!", titleClassName: "font-bold tracking-tight", cardClassName: "rounded-3xl border-2 border-(--inv-text) shadow-[6px_6px_0_0_var(--inv-c2)]" },
      between: (
        <p className="mt-16 mb-6 text-[0.7rem] font-bold tracking-[0.2em] uppercase" data-inv-reveal>
          Party starts in
        </p>
      ),
      countdown: { className: "mx-auto max-w-lg", cellClassName: "rounded-2xl border-2 border-(--inv-text) bg-(--inv-surface) shadow-[4px_4px_0_0_var(--inv-accent)]", numberClassName: "font-bold" },
    },
    details: {
      panel: { className: "mx-auto max-w-xl rounded-[2rem] bg-(--inv-surface) p-8", reveal: true },
      event: { layout: "row" },
      dressCode: { format: (v) => `Wear: ${v}`, className: "mt-6 text-sm font-medium text-(--inv-muted)" },
      calendar: { className: "mt-6", buttonClassName: "border-2 border-(--inv-text) font-semibold" },
    },
    schedule: { variant: "cards", itemClassName: "rounded-3xl border-2 border-(--inv-text)" },
    gallery: { rounded: "rounded-3xl" },
    closing: { className: "relative overflow-hidden", Ornament: ConfettiLayer, textClassName: "inv-display relative mx-auto max-w-lg text-3xl font-bold leading-tight text-pretty" },
    share: { className: "px-6 py-16 sm:py-20" },
  },
});

import { defineTemplate } from "@/features/templates/compose/define";
import { BannerCover, DrawnLine } from "@/features/templates/compose/frames";
import { TicketHero } from "@/features/templates/compose/heroes/ticket";
import { daisy } from "@/features/templates/palettes";

export const summit = defineTemplate({
  key: "summit",
  name: "Summit",
  description: "Clean and formal, with an admission-ticket masthead, a clear agenda and structured details. For conferences, launches, galas and award nights.",
  categories: ["corporate", "party", "anniversary"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "schedule", "rsvp", "contacts", "message"],
  palettes: [
    { id: "navy-brass", name: "Navy & brass", vars: { bg: "#f6f7fa", surface: "#ffffff", text: "#0f1b33", muted: "#4f5b70", accent: "#1e3a8a", accentContrast: "#ffffff", border: "#dde2ec" }, swatch: ["#f6f7fa", "#1e3a8a", "#b08d3c"] },
    { id: "boardroom", name: "Boardroom", vars: { bg: "#10151f", surface: "#171e2b", text: "#eef2f8", muted: "#a3adbf", accent: "#d4b26a", accentContrast: "#10151f", border: "#273042" }, swatch: ["#10151f", "#d4b26a", "#eef2f8"] },
    ...daisy("corporate", "business", "winter", "emerald"),
  ],
  fontPairings: [
    { id: "manrope", name: "Manrope", display: "manrope", body: "manrope" },
    { id: "montserrat-dm", name: "Montserrat & DM Sans", display: "montserrat", body: "dm-sans" },
    { id: "playfair-manrope", name: "Playfair & Manrope", display: "playfair", body: "manrope" },
  ],
  defaults: { paletteId: "navy-brass", fontPairingId: "manrope" },
  previewGradient: "linear-gradient(150deg, #f6f7fa 0%, #dbe3f4 60%, #1e3a8a 100%)",
  particles: "sparkles",
  motion: "editorial",
  recipe: {
    Hero: TicketHero,
    Cover: BannerCover,
    chapter: {
      frame: "headed",
      align: "left",
      numbered: true,
      className: "border-t border-(--inv-border)",
      countdownClassName: "border-t border-(--inv-border)",
      titleClassName: "font-semibold tracking-[-0.02em] text-3xl sm:text-4xl",
    },
    copy: {
      details: { eyebrow: "Logistics", title: "Venue & time" },
      schedule: { eyebrow: "Agenda", title: "Programme" },
      gallery: { eyebrow: "Gallery", title: "Highlights" },
      rsvp: { eyebrow: "Registration", title: "Reserve your place" },
      gifts: { eyebrow: "Notes" },
      contacts: { eyebrow: "Organisers", title: "Contact" },
    },
    intro: {
      hosts: { className: "mb-4 text-xs font-semibold tracking-[0.18em] uppercase text-(--inv-muted)", reveal: true },
      textClassName: "max-w-2xl text-xl leading-relaxed text-pretty",
      lines: { as: "ul", className: "mt-8 grid gap-2 text-left text-sm font-medium [&>li]:border-l-2 [&>li]:border-(--inv-accent) [&>li]:pl-3" },
    },
    countdown: {
      saveTheDate: { align: "left", titleClassName: "font-semibold tracking-[-0.02em]", cardClassName: "rounded-2xl border-(--inv-border) bg-(--inv-surface) shadow-none" },
      between: (
        <p className="mt-16 mb-6 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-(--inv-accent)" data-inv-reveal>
          Doors open in
        </p>
      ),
      countdown: { className: "max-w-lg", cellClassName: "rounded-xl border-(--inv-border) bg-(--inv-surface)", numberClassName: "font-semibold tracking-tight" },
    },
    details: {
      panel: { className: "rounded-2xl border border-(--inv-border) bg-(--inv-surface) p-6 sm:p-8", reveal: true },
      event: { showIcons: true, itemClassName: "items-start text-left" },
      dressCode: { format: (v) => `Dress code: ${v}`, className: "mt-6 text-sm text-(--inv-muted)" },
      calendar: { className: "mt-6 justify-start", buttonClassName: "rounded-lg" },
    },
    schedule: { className: "mx-0" },
    gallery: { rounded: "rounded-xl" },
    rsvp: { className: "mx-0" },
    gifts: { className: "mx-0 text-left [&>svg]:mx-0" },
    contacts: { className: "mx-0 max-w-none" },
    closing: { align: "left", className: "border-t border-(--inv-border)", Ornament: DrawnLine, textClassName: "inv-display max-w-2xl text-2xl leading-snug font-semibold tracking-tight text-pretty sm:text-3xl" },
    share: { className: "items-start px-6 py-16 text-left sm:px-10 sm:py-20" },
  },
});

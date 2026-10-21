import { cn } from "@/lib/utils/cn";
import { ArchCover, RuleDiamond } from "@/features/templates/compose/frames";
import { ArchHero } from "@/features/templates/compose/heroes/arch";
import { defineTemplate } from "@/features/templates/compose/define";
import { daisy } from "@/features/templates/palettes";

export const eternalGrace = defineTemplate({
  key: "eternal-grace",
  name: "Eternal Grace",
  description: "Classic serif typography, soft ivory paper and a restrained gold rule. Timeless for weddings and engagements.",
  categories: ["wedding", "engagement", "anniversary"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  palettes: [
    { id: "ivory", name: "Ivory & gold", vars: { bg: "#fbf8f1", surface: "#ffffff", text: "#2b2622", muted: "#7a7067", accent: "#ab8b55", accentContrast: "#111111", border: "#e8dfcf" }, swatch: ["#fbf8f1", "#ab8b55", "#2b2622"] },
    { id: "blush", name: "Blush", vars: { bg: "#fbf3f1", surface: "#ffffff", text: "#3a2a2a", muted: "#85696a", accent: "#b86a6e", accentContrast: "#111111", border: "#eedad6" }, swatch: ["#fbf3f1", "#b86a6e", "#3a2a2a"] },
    { id: "sage", name: "Sage", vars: { bg: "#f4f6f1", surface: "#ffffff", text: "#27302a", muted: "#69736a", accent: "#6f8a6a", accentContrast: "#111111", border: "#dce3d6" }, swatch: ["#f4f6f1", "#6f8a6a", "#27302a"] },
    { id: "slate", name: "Slate", vars: { bg: "#f3f4f6", surface: "#ffffff", text: "#232833", muted: "#69707e", accent: "#4a5a7a", accentContrast: "#ffffff", border: "#dde1e8" }, swatch: ["#f3f4f6", "#4a5a7a", "#232833"] },
    ...daisy("silk", "autumn"),
  ],
  fontPairings: [
    { id: "cormorant-lora", name: "Cormorant & Lora", display: "cormorant", body: "lora" },
    { id: "playfair-dm", name: "Playfair & DM Sans", display: "playfair", body: "dm-sans" },
    { id: "script-lora", name: "Great Vibes & Lora", display: "great-vibes", body: "lora" },
  ],
  defaults: { paletteId: "ivory", fontPairingId: "cormorant-lora" },
  previewGradient: "linear-gradient(135deg, #fbf8f1 0%, #efe4cf 100%)",
  particles: "petals",
  motion: "gentle",
  recipe: {
    Hero: ArchHero,
    Cover: ArchCover,
    chapter: { frame: "headed", numbered: true, className: "border-t border-(--inv-border)", countdownClassName: "border-t border-(--inv-border)" },
    copy: {
      details: { eyebrow: "The details", title: "When & where" },
      schedule: { eyebrow: "Celebrations", title: "Order of events" },
      gallery: { eyebrow: "Moments", title: "Our story in pictures" },
      rsvp: { eyebrow: "Kindly respond", title: "RSVP" },
      gifts: { eyebrow: "Gifts" },
      contacts: { eyebrow: "Questions", title: "Get in touch" },
    },
    intro: {
      order: "lines-text",
      hosts: false,
      textClassName: "inv-display mx-auto max-w-xl text-xl leading-relaxed text-pretty sm:text-2xl",
      lines: { as: "div", className: "mb-6 flex flex-col items-center gap-1 text-sm text-(--inv-muted) sm:flex-row sm:justify-center sm:gap-6" },
    },
    countdown: {
      saveTheDate: { titleClassName: "italic text-(--inv-accent)" },
      between: (
        <p className="mt-16 mb-6 text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-(--inv-accent)" data-inv-reveal>
          Counting down
        </p>
      ),
      countdown: { className: "mx-auto max-w-lg", cellClassName: "rounded-none border-x-0 border-t-0 bg-transparent" },
    },
    details: {
      event: { layout: "row" },
      dressCode: { format: (v) => `Dress code: ${v}`, className: "mt-8 text-sm italic text-(--inv-muted)" },
      calendar: { className: "mt-8" },
    },
    gallery: { rounded: "rounded-2xl" },
    closing: {
      className: "bg-(--inv-text) py-20 text-(--inv-bg) sm:py-28",
      Ornament: RuleDiamond,
      textClassName: "inv-display mx-auto max-w-lg text-3xl italic leading-snug text-pretty sm:text-4xl",
      signature: { className: "mt-8 text-[0.7rem] tracking-[0.28em] uppercase text-(--inv-accent)" },
    },
    share: { className: "px-6 py-16 sm:py-20" },
    branding: { className: (s) => cn(!s.message && "pt-8") },
  },
});

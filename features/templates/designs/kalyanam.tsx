import { defineTemplate } from "@/features/templates/compose/define";
import { MandalaMark, TempleCover } from "@/features/templates/compose/frames";
import { TempleHero } from "@/features/templates/compose/heroes/temple";
import { daisy } from "@/features/templates/palettes";

export const kalyanam = defineTemplate({
  key: "kalyanam",
  name: "Kalyanam",
  description: "A temple-gate invitation: marigold toran, a kolam mandala that draws itself in, classical capitals and kumkum, haldi or temple-brass colours.",
  categories: ["wedding", "engagement", "housewarming", "anniversary"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "message"],
  palettes: [
    { id: "kumkum", name: "Kumkum & ivory", vars: { bg: "#fdf6ec", surface: "#fffbf5", text: "#3b0d0c", muted: "#7a4a3a", accent: "#a3201b", accentContrast: "#ffffff", border: "#efdcc4" }, swatch: ["#fdf6ec", "#a3201b", "#e8a317"] },
    { id: "temple", name: "Temple brass", vars: { bg: "#4a0e0e", surface: "#571515", text: "#fbecd3", muted: "#dcbf98", accent: "#e9b949", accentContrast: "#3a0a0a", border: "#6e2424" }, swatch: ["#4a0e0e", "#e9b949", "#f59e0b"] },
    { id: "haldi", name: "Haldi", vars: { bg: "#fff7d6", surface: "#fffcee", text: "#3d2a05", muted: "#6f531a", accent: "#9a3f07", accentContrast: "#ffffff", border: "#f1e2a6" }, swatch: ["#fff7d6", "#9a3f07", "#facc15"] },
    { id: "peacock", name: "Peacock", vars: { bg: "#0d3b3e", surface: "#114649", text: "#f3ead7", muted: "#b5cdc7", accent: "#e8bd5a", accentContrast: "#0d3b3e", border: "#1f5a5d" }, swatch: ["#0d3b3e", "#e8bd5a", "#2dd4bf"] },
    { id: "mehendi", name: "Mehendi", vars: { bg: "#f3f5e9", surface: "#fbfcf5", text: "#26300f", muted: "#56623a", accent: "#4a6619", accentContrast: "#ffffff", border: "#dfe5c8" }, swatch: ["#f3f5e9", "#4a6619", "#f59e0b"] },
    ...daisy("caramellatte", "autumn"),
  ],
  fontPairings: [
    { id: "marcellus-lora", name: "Marcellus & Lora", display: "marcellus", body: "lora" },
    { id: "cormorant-lora", name: "Cormorant & Lora", display: "cormorant", body: "lora" },
    { id: "playfair-montserrat", name: "Playfair & Montserrat", display: "playfair", body: "montserrat" },
  ],
  defaults: { paletteId: "kumkum", fontPairingId: "marcellus-lora" },
  previewGradient: "linear-gradient(160deg, #fdf6ec 0%, #f9d9a8 55%, #f59e0b 100%)",
  particles: "petals",
  motion: "gentle",
  card: { align: "center", titleWeight: 400, titleTracking: 0.02, eyebrow: "spaced", frame: "double" },
  recipe: {
    Hero: TempleHero,
    Cover: TempleCover,
    chapter: { frame: "headed", numbered: true, className: "border-t border-(--inv-border)", countdownClassName: "border-t border-(--inv-border)", titleClassName: "tracking-[0.04em]" },
    copy: {
      details: { eyebrow: "Muhurtham", title: "When & where" },
      schedule: { eyebrow: "Ceremonies", title: "The functions" },
      gallery: { eyebrow: "Moments", title: "Memories" },
      rsvp: { eyebrow: "Your blessings", title: "Will you join us?" },
      gifts: { eyebrow: "Blessings" },
      contacts: { eyebrow: "Family", title: "Get in touch" },
    },
    intro: {
      order: "lines-text",
      hosts: false,
      textClassName: "inv-display mx-auto max-w-xl text-xl leading-relaxed text-pretty sm:text-2xl",
      lines: { as: "div", className: "mb-6 flex flex-col items-center gap-1 text-sm tracking-wide text-(--inv-muted) sm:flex-row sm:justify-center sm:gap-6" },
    },
    countdown: {
      saveTheDate: { cardClassName: "rounded-[2rem] border-(--inv-accent)/40 bg-(--inv-surface)" },
      between: (
        <p className="mt-16 mb-6 text-[0.7rem] tracking-[0.3em] uppercase text-(--inv-accent)" data-inv-reveal>
          The auspicious hour approaches
        </p>
      ),
      countdown: { className: "mx-auto max-w-lg", cellClassName: "rounded-2xl border-(--inv-accent)/40 bg-(--inv-surface)", numberClassName: "text-(--inv-accent)" },
    },
    details: {
      panel: { className: "mx-auto max-w-xl rounded-t-[8rem] rounded-b-[2rem] border border-(--inv-accent)/40 bg-(--inv-surface) px-8 pt-14 pb-10 sm:rounded-t-[12rem] sm:px-12", reveal: true },
      dressCode: { format: (v) => `Attire: ${v}`, className: "mt-6 text-sm italic text-(--inv-muted)" },
      calendar: { className: "mt-6" },
    },
    schedule: { variant: "cards", itemClassName: "rounded-2xl border-(--inv-accent)/30 bg-(--inv-surface)" },
    gallery: { rounded: "rounded-t-[999px] rounded-b-2xl" },
    closing: {
      className: "bg-(--inv-text) py-20 text-(--inv-bg) sm:py-28",
      Ornament: MandalaMark,
      textClassName: "inv-display mx-auto max-w-lg text-3xl leading-snug text-pretty sm:text-4xl",
      signature: { className: "mt-8 text-[0.7rem] tracking-[0.3em] uppercase text-(--inv-accent)" },
    },
    share: { className: "px-6 py-16 sm:py-20" },
  },
});

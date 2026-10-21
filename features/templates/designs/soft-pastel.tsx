import { BlobsBackdrop, PebbleCover } from "@/features/templates/compose/frames";
import { SoftHero } from "@/features/templates/compose/heroes/soft";
import { defineTemplate } from "@/features/templates/compose/define";
import { daisy } from "@/features/templates/palettes";

export const softPastel = defineTemplate({
  key: "soft-pastel",
  name: "Soft Pastel",
  description: "Gentle pastel washes and rounded shapes. Warm and welcoming for showers and family celebrations.",
  categories: ["baby-shower", "birthday", "housewarming"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "gallery", "rsvp", "contacts", "gifts", "message"],
  palettes: [
    { id: "peach", name: "Peach", vars: { bg: "#fff6f0", surface: "#ffffff", text: "#3b2f2a", muted: "#816d68", accent: "#d4755b", accentContrast: "#111111", border: "#f3e1d8" }, swatch: ["#fff6f0", "#d4755b", "#fde2cf"] },
    { id: "mint", name: "Mint", vars: { bg: "#f1faf6", surface: "#ffffff", text: "#23352d", muted: "#62766d", accent: "#3f8f6b", accentContrast: "#111111", border: "#d8ebe2" }, swatch: ["#f1faf6", "#3f8f6b", "#cdeedd"] },
    { id: "lilac", name: "Lilac", vars: { bg: "#f8f4fc", surface: "#ffffff", text: "#332a3f", muted: "#786c86", accent: "#8b6cc1", accentContrast: "#111111", border: "#e7dcf2" }, swatch: ["#f8f4fc", "#8b6cc1", "#e5d7f5"] },
    { id: "sky", name: "Sky", vars: { bg: "#f2f8fd", surface: "#ffffff", text: "#24323f", muted: "#637384", accent: "#4a8fd1", accentContrast: "#111111", border: "#dbe8f4" }, swatch: ["#f2f8fd", "#4a8fd1", "#d4e7f8"] },
    ...daisy("pastel", "cupcake"),
  ],
  fontPairings: [
    { id: "fraunces-dm", name: "Fraunces & DM Sans", display: "fraunces", body: "dm-sans" },
    { id: "lora-manrope", name: "Lora & Manrope", display: "lora", body: "manrope" },
  ],
  defaults: { paletteId: "peach", fontPairingId: "fraunces-dm" },
  previewGradient: "linear-gradient(135deg, #fff6f0 0%, #fde2cf 50%, #e5d7f5 100%)",
  particles: "petals",
  motion: "gentle",
  card: { align: "center", titleWeight: 500, eyebrow: "pill", frame: "none" },
  recipe: {
    article: "relative overflow-hidden",
    Backdrop: BlobsBackdrop,
    Hero: SoftHero,
    Cover: PebbleCover,
    chapter: { frame: "headed", className: "relative", introClassName: "relative", countdownClassName: "relative" },
    copy: {
      details: { eyebrow: "Details", title: "Where & when" },
      schedule: { eyebrow: "Plan", title: "The day" },
      gallery: { eyebrow: "Photos", title: "Little moments" },
      rsvp: { eyebrow: "Join us", title: "RSVP" },
      gifts: { eyebrow: "Gifts" },
      contacts: { eyebrow: "Questions", title: "Get in touch" },
    },
    intro: {
      hosts: { className: "mb-3 text-sm text-(--inv-muted)", reveal: true },
      textClassName: "mx-auto max-w-xl text-lg leading-relaxed text-pretty",
      lines: { as: "p", className: "mt-4 text-sm font-medium text-(--inv-accent)" },
    },
    countdown: {
      saveTheDate: { cardClassName: "rounded-[2.5rem] border-0 bg-(--inv-surface)/80 shadow-sm backdrop-blur" },
      between: (
        <p className="mt-16 mb-6 text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-(--inv-accent)" data-inv-reveal>
          Almost time
        </p>
      ),
      countdown: { className: "mx-auto max-w-lg", cellClassName: "rounded-3xl border-0 bg-(--inv-surface)/80 shadow-sm" },
    },
    details: {
      panel: { className: "mx-auto max-w-xl rounded-[2.5rem] bg-(--inv-surface)/80 p-8 shadow-sm backdrop-blur sm:p-10", reveal: true },
      event: { layout: "row" },
      dressCode: { format: (v) => `Dress code: ${v}`, className: "mt-6 text-sm text-(--inv-muted)" },
      calendar: { className: "mt-6", buttonClassName: "border-0 bg-(--inv-surface)/80 shadow-sm" },
    },
    schedule: { variant: "cards", itemClassName: "rounded-[2rem] border-0 bg-(--inv-surface)/80 shadow-sm" },
    gallery: { rounded: "rounded-[2rem]" },
    contacts: { className: "[&>li]:border-0 [&>li]:bg-(--inv-surface)/80 [&>li]:shadow-sm" },
    closing: { className: "relative", textClassName: "inv-display mx-auto max-w-lg text-2xl leading-relaxed text-pretty sm:text-3xl" },
    share: { className: "px-6 py-16 sm:py-20" },
    branding: { className: "relative" },
  },
});

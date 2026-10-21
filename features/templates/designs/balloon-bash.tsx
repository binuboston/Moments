import { defineTemplate } from "@/features/templates/compose/define";
import { BalloonPair, PolaroidCover } from "@/features/templates/compose/frames";
import { PartyHero } from "@/features/templates/compose/heroes/party";
import { daisy } from "@/features/templates/palettes";

export const balloonBash = defineTemplate({
  key: "balloon-bash",
  name: "Balloon Bash",
  description: "Bobbing balloons, chunky rounded type and sticker-bright colours. Made for kids' birthdays, showers and parties.",
  categories: ["birthday", "baby-shower", "party"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "gallery", "rsvp", "contacts", "message"],
  palettes: [
    { id: "bubblegum", name: "Bubblegum", vars: { bg: "#fff5fb", surface: "#ffffff", text: "#2d1b3d", muted: "#6a5679", accent: "#c2255c", accentContrast: "#ffffff", border: "#f6d7e8" }, swatch: ["#fff5fb", "#c2255c", "#4dabf7"] },
    ...daisy("cupcake", "bumblebee", "pastel", "lemonade", "fantasy"),
  ],
  fontPairings: [
    { id: "fredoka-poppins", name: "Fredoka & Poppins", display: "fredoka", body: "poppins" },
    { id: "fredoka-dm", name: "Fredoka & DM Sans", display: "fredoka", body: "dm-sans" },
    { id: "poppins", name: "Poppins", display: "poppins", body: "dm-sans" },
  ],
  defaults: { paletteId: "bubblegum", fontPairingId: "fredoka-poppins" },
  previewGradient: "linear-gradient(160deg, #ffe3f1 0%, #fff5fb 45%, #dbeafe 100%)",
  particles: "confetti",
  motion: "playful",
  card: { align: "center", titleWeight: 700, titleTracking: -0.01, eyebrow: "pill", frame: "none" },
  recipe: {
    Hero: PartyHero,
    Cover: PolaroidCover,
    chapter: { frame: "headed", className: "relative", titleClassName: "font-bold tracking-tight", eyebrowClassName: "font-bold" },
    copy: {
      details: { eyebrow: "Where's the party?", title: "The details" },
      schedule: { eyebrow: "Plan", title: "Fun on the day" },
      gallery: { eyebrow: "Snapshots", title: "Photos" },
      rsvp: { eyebrow: "Can you come?", title: "RSVP" },
      gifts: { eyebrow: "Gifts" },
      contacts: { eyebrow: "Grown-ups", title: "Say hello" },
    },
    intro: {
      hosts: { className: "mb-3 text-sm font-semibold text-(--inv-muted)", reveal: true },
      textClassName: "mx-auto max-w-xl text-lg leading-relaxed font-medium text-pretty sm:text-xl",
      lines: { as: "p", className: "mt-4 text-sm font-semibold text-(--inv-accent)" },
    },
    countdown: {
      saveTheDate: { title: "Save the date!", titleClassName: "font-bold tracking-tight", cardClassName: "rounded-[2rem] border-2 border-dashed border-(--inv-accent)/60 shadow-none" },
      between: (
        <p className="mt-16 mb-6 text-[0.75rem] font-bold tracking-[0.18em] uppercase text-(--inv-accent)" data-inv-reveal>
          Party starts in
        </p>
      ),
      countdown: { className: "mx-auto max-w-lg", cellClassName: "rounded-[1.75rem] border-0 bg-(--inv-surface) shadow-[0_6px_0_0_var(--inv-c2)]", numberClassName: "font-bold" },
    },
    details: {
      panel: { className: "mx-auto max-w-xl rounded-[2.5rem] border-2 border-dashed border-(--inv-accent)/50 bg-(--inv-surface) p-8 sm:p-10", reveal: true },
      event: { layout: "row" },
      dressCode: { format: (v) => `Wear: ${v}`, className: "mt-6 text-sm font-semibold text-(--inv-muted)" },
      calendar: { className: "mt-6", buttonClassName: "rounded-full border-2 border-(--inv-accent)/50 font-semibold" },
    },
    schedule: { variant: "cards", itemClassName: "rounded-[2rem] border-0 bg-(--inv-surface) shadow-[0_6px_0_0_var(--inv-c3)]" },
    gallery: { rounded: "rounded-[2rem]" },
    contacts: { className: "[&>li]:rounded-[1.5rem]" },
    closing: { Ornament: BalloonPair, textClassName: "inv-display mx-auto max-w-lg text-3xl font-bold leading-tight text-pretty sm:text-4xl" },
    share: { className: "px-6 py-16 sm:py-20" },
  },
});

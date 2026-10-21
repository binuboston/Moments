import { LeafOrnament } from "@/features/templates/designs/shared";
import { GlowCover, LeavesBackdrop } from "@/features/templates/compose/frames";
import { BotanicalHero } from "@/features/templates/compose/heroes/botanical";
import { defineTemplate } from "@/features/templates/compose/define";
import { daisy } from "@/features/templates/palettes";

export const botanicalNoir = defineTemplate({
  key: "botanical-noir",
  name: "Botanical Noir",
  description: "Deep forest tones with hand-drawn foliage and luminous type. Moody, modern and memorable.",
  categories: ["wedding", "engagement", "anniversary", "party"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  palettes: [
    { id: "forest", name: "Forest", vars: { bg: "#13231c", surface: "#1b2f26", text: "#f3efe4", muted: "#a9b5a9", accent: "#d8b56a", accentContrast: "#13231c", border: "#2b4337" }, swatch: ["#13231c", "#d8b56a", "#f3efe4"] },
    { id: "midnight", name: "Midnight", vars: { bg: "#111827", surface: "#1a2234", text: "#eef1f7", muted: "#9ba4b5", accent: "#c9b27c", accentContrast: "#111827", border: "#2a3447" }, swatch: ["#111827", "#c9b27c", "#eef1f7"] },
    { id: "aubergine", name: "Aubergine", vars: { bg: "#2a1a2a", surface: "#352236", text: "#f6eef4", muted: "#b39cae", accent: "#e0a97a", accentContrast: "#2a1a2a", border: "#4a3249" }, swatch: ["#2a1a2a", "#e0a97a", "#f6eef4"] },
    { id: "charcoal", name: "Charcoal", vars: { bg: "#1d1d1b", surface: "#272725", text: "#f2f1ec", muted: "#a5a49d", accent: "#c2a26a", accentContrast: "#1d1d1b", border: "#3a3a36" }, swatch: ["#1d1d1b", "#c2a26a", "#f2f1ec"] },
    ...daisy("forest", "night"),
  ],
  fontPairings: [
    { id: "playfair-montserrat", name: "Playfair & Montserrat", display: "playfair", body: "montserrat" },
    { id: "cormorant-manrope", name: "Cormorant & Manrope", display: "cormorant", body: "manrope" },
  ],
  defaults: { paletteId: "forest", fontPairingId: "playfair-montserrat" },
  previewGradient: "linear-gradient(160deg, #13231c 0%, #1f3a2e 100%)",
  particles: "sparkles",
  motion: "editorial",
  card: { align: "center", titleWeight: 500, titleItalic: true, eyebrow: "spaced", frame: "inset" },
  recipe: {
    article: "relative overflow-hidden",
    Backdrop: LeavesBackdrop,
    Hero: BotanicalHero,
    Cover: GlowCover,
    chapter: { frame: "headed", numbered: true },
    copy: {
      details: { eyebrow: "Join us", title: "The details" },
      schedule: { eyebrow: "Programme", title: "Celebrations" },
      gallery: { eyebrow: "Gallery", title: "Moments" },
      rsvp: { eyebrow: "Répondez s'il vous plaît", title: "Will you join us?" },
      gifts: { eyebrow: "Gifts" },
      contacts: { eyebrow: "Questions", title: "Contact" },
    },
    intro: {
      hosts: { className: "mb-4 text-sm italic text-(--inv-muted)", reveal: true },
      textClassName: "mx-auto max-w-xl text-lg leading-relaxed text-pretty sm:text-xl",
      lines: { as: "div", className: "mt-6 flex flex-col items-center gap-1 text-sm text-(--inv-muted)" },
    },
    countdown: {
      saveTheDate: { titleClassName: "italic", cardClassName: "rounded-[2rem] border-(--inv-accent)/30" },
      between: <div className="mt-16" />,
      countdown: { className: "mx-auto max-w-lg", cellClassName: "border-(--inv-accent)/30 bg-(--inv-surface)", numberClassName: "text-(--inv-accent)" },
    },
    details: {
      panel: { className: "mx-auto max-w-xl rounded-[2rem] border border-(--inv-accent)/30 bg-(--inv-surface) p-8 sm:p-10", reveal: true },
      dressCode: { format: (v) => `Attire: ${v}`, className: "mt-6 text-sm italic text-(--inv-muted)" },
      calendar: { className: "mt-6" },
    },
    schedule: { variant: "cards", itemClassName: "border-(--inv-accent)/20" },
    gallery: { rounded: "rounded-[1.25rem]" },
    closing: { textClassName: "inv-display mx-auto max-w-lg text-2xl italic leading-relaxed text-pretty sm:text-3xl" },
    share: { className: "px-6 py-16 sm:py-20" },
    branding: { className: "relative pt-6" },
    Tail: ({ share, branding }) => (
      <div className="relative">
        <LeafOrnament className="absolute -bottom-10 -right-6 size-40 -scale-x-100 opacity-30" />
        {share}
        {branding}
      </div>
    ),
  },
});

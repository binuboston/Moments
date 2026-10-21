import { DecoCover, DrawnLine } from "@/features/templates/compose/frames";
import { DecoHero } from "@/features/templates/compose/heroes/deco";
import { defineTemplate } from "@/features/templates/compose/define";
import { daisy } from "@/features/templates/palettes";

export const goldenGala = defineTemplate({
  key: "golden-gala",
  name: "Golden Gala",
  description: "Black tie elegance: midnight background, champagne accents and an art deco frame.",
  categories: ["corporate", "anniversary", "party", "birthday"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "message"],
  palettes: [
    { id: "midnight-gold", name: "Midnight gold", vars: { bg: "#0f0f12", surface: "#17171c", text: "#f5f0e6", muted: "#a39e94", accent: "#d4af6a", accentContrast: "#0f0f12", border: "#2a2a31" }, swatch: ["#0f0f12", "#d4af6a", "#f5f0e6"] },
    { id: "emerald-gold", name: "Emerald gold", vars: { bg: "#0b1f1a", surface: "#122a23", text: "#f2f1e8", muted: "#9db0a6", accent: "#d9b56e", accentContrast: "#0b1f1a", border: "#1f3b33" }, swatch: ["#0b1f1a", "#d9b56e", "#f2f1e8"] },
    { id: "burgundy-gold", name: "Burgundy gold", vars: { bg: "#26101a", surface: "#331622", text: "#f7eff0", muted: "#b39aa3", accent: "#e0b56f", accentContrast: "#26101a", border: "#45202f" }, swatch: ["#26101a", "#e0b56f", "#f7eff0"] },
    { id: "silver-noir", name: "Silver noir", vars: { bg: "#111214", surface: "#1a1b1f", text: "#f1f2f4", muted: "#9ea1a8", accent: "#c9cdd4", accentContrast: "#111214", border: "#2c2e34" }, swatch: ["#111214", "#c9cdd4", "#f1f2f4"] },
    ...daisy("luxury", "coffee"),
  ],
  fontPairings: [
    { id: "cormorant-josefin", name: "Cormorant & Josefin", display: "cormorant", body: "josefin" },
    { id: "playfair-montserrat", name: "Playfair & Montserrat", display: "playfair", body: "montserrat" },
  ],
  defaults: { paletteId: "midnight-gold", fontPairingId: "cormorant-josefin" },
  previewGradient: "linear-gradient(160deg, #0f0f12 0%, #2a2318 100%)",
  particles: "sparkles",
  motion: "editorial",
  card: { align: "center", titleWeight: 500, titleUppercase: true, titleTracking: 0.04, eyebrow: "spaced", frame: "double" },
  recipe: {
    Hero: DecoHero,
    Cover: DecoCover,
    chapter: { frame: "headed", numbered: true, titleClassName: "uppercase tracking-[0.08em] text-2xl sm:text-3xl" },
    copy: {
      details: { eyebrow: "Evening details", title: "When & where" },
      schedule: { eyebrow: "Programme", title: "Order of the evening" },
      gallery: { eyebrow: "Gallery", title: "Highlights" },
      rsvp: { eyebrow: "Reply", title: "Kindly respond" },
      gifts: { eyebrow: "Gifts" },
      contacts: { eyebrow: "Enquiries", title: "Contact" },
    },
    intro: {
      hosts: { className: "mb-4 text-xs tracking-[0.2em] uppercase text-(--inv-muted)" },
      textClassName: "inv-display mx-auto max-w-xl text-xl leading-relaxed text-pretty sm:text-2xl",
      lines: { as: "ul", className: "mt-8 inline-flex flex-col gap-2 border-y border-(--inv-accent)/40 py-4 text-sm tracking-wide text-(--inv-muted)" },
    },
    countdown: {
      saveTheDate: { titleClassName: "uppercase tracking-[0.08em] text-4xl sm:text-5xl", cardClassName: "rounded-none border-(--inv-accent)/40 bg-transparent shadow-none" },
      between: <div className="mx-auto mt-16 mb-6 h-px w-24 bg-(--inv-accent)/60" aria-hidden />,
      countdown: { className: "mx-auto max-w-lg", cellClassName: "rounded-none border-(--inv-accent)/40 bg-transparent", numberClassName: "text-(--inv-accent)" },
    },
    details: {
      panel: { className: "mx-auto max-w-xl border border-(--inv-accent)/40 p-8 sm:p-10" },
      dressCode: { format: (v) => `Dress code · ${v}`, className: "mt-6 text-xs tracking-[0.2em] uppercase text-(--inv-muted)" },
      calendar: { className: "mt-6", buttonClassName: "rounded-none border-(--inv-accent)/40 uppercase tracking-[0.12em] text-xs" },
    },
    gallery: { rounded: "rounded-none" },
    closing: { Ornament: DrawnLine, textClassName: "inv-display mx-auto max-w-lg text-2xl leading-relaxed text-pretty" },
    share: { className: "px-6 py-16 sm:py-20" },
  },
});

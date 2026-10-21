import { formatEventDate } from "@/lib/utils/dates";
import { AccentRule, WideCover } from "@/features/templates/compose/frames";
import { EditorialHero } from "@/features/templates/compose/heroes/editorial";
import { titleParts } from "@/features/templates/title";
import { defineTemplate } from "@/features/templates/compose/define";
import { daisy } from "@/features/templates/palettes";

export const modernMinimal = defineTemplate({
  key: "modern-minimal",
  name: "Modern Minimal",
  description: "Bold typographic layout with generous whitespace. Works for any occasion that wants to feel considered.",
  categories: ["birthday", "corporate", "housewarming", "party", "anniversary", "engagement", "wedding"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  palettes: [
    { id: "mono", name: "Mono & coral", vars: { bg: "#ffffff", surface: "#f7f7f5", text: "#111111", muted: "#6b6b6b", accent: "#e4572e", accentContrast: "#111111", border: "#e4e4e0" }, swatch: ["#ffffff", "#e4572e", "#111111"] },
    { id: "ink-sky", name: "Ink & sky", vars: { bg: "#f7f9fc", surface: "#ffffff", text: "#0f172a", muted: "#64748b", accent: "#2563eb", accentContrast: "#ffffff", border: "#e2e8f0" }, swatch: ["#f7f9fc", "#2563eb", "#0f172a"] },
    { id: "sand", name: "Sand & terracotta", vars: { bg: "#f8f3ea", surface: "#ffffff", text: "#2b2117", muted: "#7c6b5a", accent: "#b65a3a", accentContrast: "#ffffff", border: "#e9dfd0" }, swatch: ["#f8f3ea", "#b65a3a", "#2b2117"] },
    { id: "olive", name: "Olive", vars: { bg: "#f6f7f2", surface: "#ffffff", text: "#1f2a1c", muted: "#687462", accent: "#5f7a3a", accentContrast: "#ffffff", border: "#e0e5d8" }, swatch: ["#f6f7f2", "#5f7a3a", "#1f2a1c"] },
    ...daisy("nord", "garden"),
  ],
  fontPairings: [
    { id: "manrope", name: "Manrope", display: "manrope", body: "dm-sans" },
    { id: "josefin-manrope", name: "Josefin & Manrope", display: "josefin", body: "manrope" },
    { id: "fraunces-dm", name: "Fraunces & DM Sans", display: "fraunces", body: "dm-sans" },
  ],
  defaults: { paletteId: "mono", fontPairingId: "manrope" },
  previewGradient: "linear-gradient(135deg, #ffffff 0%, #f0f0ec 100%)",
  particles: "sparkles",
  motion: "editorial",
  recipe: {
    Hero: EditorialHero,
    Cover: WideCover,
    NoCover: AccentRule,
    chapter: { frame: "sidebar", intro: { label: "About", side: true } },
    copy: {
      details: { label: "Where", side: true },
      schedule: { label: "Schedule", side: true },
      gallery: { label: "Gallery" },
      rsvp: { label: "RSVP", note: "Let us know if you can make it.", side: true },
      gifts: { label: "Gifts", side: true },
      contacts: { label: "Contact" },
    },
    intro: {
      hosts: { className: "mb-3 text-sm text-(--inv-muted)", reveal: true },
      textClassName: "text-xl leading-relaxed text-pretty",
      lines: { as: "ul", className: "mt-6 space-y-1 text-sm text-(--inv-muted)" },
    },
    countdown: {
      saveTheDate: { align: "left", titleClassName: "font-bold tracking-[-0.03em]", cardClassName: "rounded-none shadow-none" },
      between: <div className="mt-16" />,
      countdown: { className: "max-w-lg", cellClassName: "rounded-none border-0 bg-transparent px-0 text-left", numberClassName: "font-bold tracking-tight" },
    },
    details: {
      event: { showIcons: false, itemClassName: "items-start text-left" },
      dressCode: { format: (v) => `Dress code · ${v}`, className: "mt-6 text-sm text-(--inv-muted)" },
      calendar: { className: "mt-6 justify-start", buttonClassName: "rounded-none" },
    },
    schedule: { className: "mx-0" },
    gallery: { rounded: "rounded-none" },
    rsvp: { className: "mx-0" },
    gifts: { className: "mx-0 text-left [&>svg]:mx-0" },
    contacts: { className: "mx-0 max-w-none" },
    closing: { align: "left", className: "border-t border-(--inv-border)", textClassName: "inv-display max-w-xl text-3xl leading-tight font-semibold tracking-tight text-pretty" },
    share: { className: "items-start px-6 py-16 text-left sm:px-10 sm:py-20" },
    Tail: ({ view, share, branding }) => (
      <>
        {share}
        <footer className="mx-6 flex items-center justify-between border-t border-(--inv-text) py-6 text-[0.65rem] tracking-[0.2em] uppercase sm:mx-10">
          <span>{titleParts(view.content).title}</span>
          <span className="text-(--inv-muted)">{formatEventDate(view.content.startsAt, view.content.timezone)}</span>
        </footer>
        {branding}
      </>
    ),
  },
});

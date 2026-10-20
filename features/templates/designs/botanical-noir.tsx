import { formatEventDate, formatEventTime } from "@/lib/utils/dates";
import { Branding, CalendarActions, Contacts, Countdown, EventDetails, Gallery, Gifts, RsvpForm, Schedule, Section } from "@/features/templates/sections";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";
import { CoverImage, LeafOrnament, kindDetails, HeroTitle } from "@/features/templates/designs/shared";

function BotanicalNoir({ view, theme, mode }: TemplateProps) {
  const { content, media } = view;
  const details = kindDetails(view);
  const s = theme.sections;

  return (
    <article className="relative mx-auto w-full max-w-3xl overflow-hidden">
      <LeafOrnament className="absolute -top-6 -left-8 size-48 opacity-40 sm:size-64" />
      <LeafOrnament className="absolute -right-10 top-40 size-48 rotate-180 opacity-30 sm:size-64" />

      <header className="relative px-6 pt-20 pb-14 text-center sm:px-12 sm:pt-28">
        <p className="text-[0.7rem] font-medium tracking-[0.32em] uppercase text-(--inv-accent)">{details.eyebrow}</p>
        <HeroTitle view={view} className="inv-display mt-6 text-5xl leading-[1] italic text-balance sm:text-7xl" headlineClassName="tracking-[0.08em] text-(--inv-muted)" />
        {content.subheading ? <p className="mt-5 text-base tracking-[0.08em] text-(--inv-muted) sm:text-lg">{content.subheading}</p> : null}
        <div className="mx-auto mt-10 grid max-w-sm grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm">
          <span className="h-px bg-(--inv-border)" />
          <span className="tracking-[0.2em] uppercase">{formatEventDate(content.startsAt, content.timezone)}</span>
          <span className="h-px bg-(--inv-border)" />
        </div>
        <p className="mt-3 text-sm text-(--inv-muted)">{formatEventTime(content.startsAt, content.timezone)}{content.venue.name ? ` · ${content.venue.name}` : ""}</p>
      </header>

      {media.cover ? (
        <div className="relative mx-6 aspect-[4/5] overflow-hidden rounded-[2rem] ring-1 ring-(--inv-accent)/40 sm:mx-12">
          <CoverImage media={media.cover} priority className="opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-(--inv-bg) via-transparent to-transparent" />
        </div>
      ) : null}

      {s.intro ? (
        <Section>
          {content.hosts ? <p className="mb-4 text-sm italic text-(--inv-muted)">{content.hosts}</p> : null}
          {content.intro ? <p className="mx-auto max-w-xl text-lg leading-relaxed text-pretty sm:text-xl">{content.intro}</p> : null}
          {details.lines.length ? (
            <div className="mt-6 flex flex-col items-center gap-1 text-sm text-(--inv-muted)">
              {details.lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          ) : null}
        </Section>
      ) : null}

      {s.countdown ? (
        <Section className="pt-0">
          <Countdown targetIso={content.startsAt} className="mx-auto max-w-lg" cellClassName="border-(--inv-accent)/30 bg-(--inv-surface)" numberClassName="text-(--inv-accent)" />
        </Section>
      ) : null}

      {s.details ? (
        <Section eyebrow="Join us" title="The details">
          <div className="mx-auto max-w-xl rounded-[2rem] border border-(--inv-accent)/30 bg-(--inv-surface) p-8 sm:p-10">
            <EventDetails view={view} />
            {content.dressCode ? <p className="mt-6 text-sm italic text-(--inv-muted)">Attire: {content.dressCode}</p> : null}
          </div>
          <CalendarActions view={view} className="mt-6" />
        </Section>
      ) : null}

      {s.schedule ? (
        <Section eyebrow="Programme" title="Celebrations">
          <Schedule functions={view.functions} variant="cards" itemClassName="border-(--inv-accent)/20" />
        </Section>
      ) : null}

      {s.gallery ? (
        <Section eyebrow="Gallery" title="Moments">
          <Gallery items={media.gallery} rounded="rounded-[1.25rem]" />
        </Section>
      ) : null}

      {s.rsvp ? (
        <Section eyebrow="Répondez s'il vous plaît" title="Will you join us?">
          <RsvpForm slug={view.slug} settings={view.settings.rsvp} timezone={content.timezone} mode={mode} />
        </Section>
      ) : null}

      {s.gifts ? (
        <Section eyebrow="Gifts">
          <Gifts gifts={content.gifts} />
        </Section>
      ) : null}

      {s.contacts ? (
        <Section eyebrow="Questions" title="Contact">
          <Contacts contacts={content.contacts} />
        </Section>
      ) : null}

      {s.message ? (
        <Section>
          <p className="inv-display mx-auto max-w-lg text-2xl italic leading-relaxed text-pretty sm:text-3xl">{content.message}</p>
        </Section>
      ) : null}

      <div className="relative">
        <LeafOrnament className="absolute -bottom-10 -right-6 size-40 -scale-x-100 opacity-30" />
        <Branding show={view.showBranding} className="relative pt-6" />
      </div>
    </article>
  );
}

export const botanicalNoir: TemplateDefinition = {
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
  ],
  fontPairings: [
    { id: "playfair-montserrat", name: "Playfair & Montserrat", display: "playfair", body: "montserrat" },
    { id: "cormorant-manrope", name: "Cormorant & Manrope", display: "cormorant", body: "manrope" },
  ],
  defaults: { paletteId: "forest", fontPairingId: "playfair-montserrat" },
  previewGradient: "linear-gradient(160deg, #13231c 0%, #1f3a2e 100%)",
  component: BotanicalNoir,
};

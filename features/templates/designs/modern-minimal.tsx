import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import { Branding, CalendarActions, Contacts, Countdown, EventDetails, Gallery, Gifts, RsvpForm, Schedule, Section } from "@/features/templates/sections";
import { titleParts } from "@/features/templates/title";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";
import { CoverImage, kindDetails, HeroTitle } from "@/features/templates/designs/shared";

function ModernMinimal({ view, theme, mode }: TemplateProps) {
  const { content, media } = view;
  const details = kindDetails(view);
  const s = theme.sections;
  const date = formatEventDate(content.startsAt, content.timezone);
  const time = formatTimeRange(content.startsAt, content.endsAt, content.timezone);

  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="px-6 pt-12 sm:px-10 sm:pt-16">
        <div className="flex items-center justify-between border-b border-(--inv-text) pb-4 text-[0.7rem] font-semibold tracking-[0.2em] uppercase">
          <span>{details.eyebrow}</span>
          <span className="text-(--inv-accent)">{formatEventDate(content.startsAt, content.timezone).split(" ").slice(-2).join(" ")}</span>
        </div>
        <HeroTitle view={view} className="inv-display mt-10 text-[clamp(2.75rem,10vw,6rem)] leading-[0.95] font-bold tracking-[-0.03em] text-balance" headlineClassName="text-sm font-semibold tracking-[0.12em] uppercase text-(--inv-accent)" />
        {content.subheading ? <p className="mt-6 max-w-md text-lg text-(--inv-muted)">{content.subheading}</p> : null}
        <dl className="mt-10 grid gap-6 border-t border-(--inv-border) pt-6 sm:grid-cols-3">
          <div>
            <dt className="text-[0.65rem] tracking-[0.2em] uppercase text-(--inv-muted)">Date</dt>
            <dd className="mt-1 font-medium">{date}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] tracking-[0.2em] uppercase text-(--inv-muted)">Time</dt>
            <dd className="mt-1 font-medium">{time}</dd>
          </div>
          {content.venue.name ? (
            <div>
              <dt className="text-[0.65rem] tracking-[0.2em] uppercase text-(--inv-muted)">Venue</dt>
              <dd className="mt-1 font-medium">{content.venue.name}</dd>
            </div>
          ) : null}
        </dl>
      </header>

      {media.cover ? (
        <div className="relative mt-10 aspect-[16/10] overflow-hidden">
          <CoverImage media={media.cover} priority />
        </div>
      ) : (
        <div className="mx-6 mt-10 h-1.5 bg-(--inv-accent) sm:mx-10" aria-hidden />
      )}

      {s.intro ? (
        <Section align="left" className="sm:grid sm:grid-cols-[1fr_2fr] sm:gap-10">
          <p className="mb-4 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-(--inv-accent) sm:mb-0">About</p>
          <div>
            {content.hosts ? <p className="mb-3 text-sm text-(--inv-muted)">{content.hosts}</p> : null}
            {content.intro ? <p className="text-xl leading-relaxed text-pretty">{content.intro}</p> : null}
            {details.lines.length ? (
              <ul className="mt-6 space-y-1 text-sm text-(--inv-muted)">
                {details.lines.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </Section>
      ) : null}

      {s.countdown ? (
        <Section align="left" className="border-t border-(--inv-border)">
          <Countdown targetIso={content.startsAt} className="max-w-lg" cellClassName="rounded-none border-0 bg-transparent px-0 text-left" numberClassName="font-bold tracking-tight" />
        </Section>
      ) : null}

      {s.details ? (
        <Section align="left" className="border-t border-(--inv-border) sm:grid sm:grid-cols-[1fr_2fr] sm:gap-10">
          <p className="mb-4 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-(--inv-accent) sm:mb-0">Where</p>
          <div>
            <EventDetails view={view} showIcons={false} itemClassName="items-start text-left" />
            {content.dressCode ? <p className="mt-6 text-sm text-(--inv-muted)">Dress code · {content.dressCode}</p> : null}
            <CalendarActions view={view} className="mt-6 justify-start" buttonClassName="rounded-none" />
          </div>
        </Section>
      ) : null}

      {s.schedule ? (
        <Section align="left" className="border-t border-(--inv-border) sm:grid sm:grid-cols-[1fr_2fr] sm:gap-10">
          <p className="mb-4 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-(--inv-accent) sm:mb-0">Schedule</p>
          <Schedule functions={view.functions} className="mx-0" />
        </Section>
      ) : null}

      {s.gallery ? (
        <Section align="left" className="border-t border-(--inv-border)">
          <p className="mb-6 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-(--inv-accent)">Gallery</p>
          <Gallery items={media.gallery} rounded="rounded-none" />
        </Section>
      ) : null}

      {s.rsvp ? (
        <Section align="left" className="border-t border-(--inv-border) sm:grid sm:grid-cols-[1fr_2fr] sm:gap-10">
          <div className="mb-6 sm:mb-0">
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-(--inv-accent)">RSVP</p>
            <p className="mt-2 text-sm text-(--inv-muted)">Let us know if you can make it.</p>
          </div>
          <RsvpForm slug={view.slug} settings={view.settings.rsvp} timezone={content.timezone} mode={mode} className="mx-0" />
        </Section>
      ) : null}

      {s.gifts ? (
        <Section align="left" className="border-t border-(--inv-border) sm:grid sm:grid-cols-[1fr_2fr] sm:gap-10">
          <p className="mb-4 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-(--inv-accent) sm:mb-0">Gifts</p>
          <Gifts gifts={content.gifts} className="mx-0 text-left [&>svg]:mx-0" />
        </Section>
      ) : null}

      {s.contacts ? (
        <Section align="left" className="border-t border-(--inv-border)">
          <p className="mb-6 text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-(--inv-accent)">Contact</p>
          <Contacts contacts={content.contacts} className="mx-0 max-w-none" />
        </Section>
      ) : null}

      {s.message ? (
        <Section align="left" className="border-t border-(--inv-border)">
          <p className="inv-display max-w-xl text-3xl leading-tight font-semibold tracking-tight text-pretty">{content.message}</p>
        </Section>
      ) : null}

      <footer className="mx-6 flex items-center justify-between border-t border-(--inv-text) py-6 text-[0.65rem] tracking-[0.2em] uppercase sm:mx-10">
        <span>{titleParts(content).title}</span>
        <span className="text-(--inv-muted)">{date}</span>
      </footer>
      <Branding show={view.showBranding} />
    </article>
  );
}

export const modernMinimal: TemplateDefinition = {
  key: "modern-minimal",
  name: "Modern Minimal",
  description: "Bold typographic layout with generous whitespace. Works for any occasion that wants to feel considered.",
  categories: ["birthday", "corporate", "housewarming", "party", "anniversary", "engagement", "wedding"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  palettes: [
    { id: "mono", name: "Mono & coral", vars: { bg: "#ffffff", surface: "#f7f7f5", text: "#111111", muted: "#6b6b6b", accent: "#e4572e", accentContrast: "#ffffff", border: "#e4e4e0" }, swatch: ["#ffffff", "#e4572e", "#111111"] },
    { id: "ink-sky", name: "Ink & sky", vars: { bg: "#f7f9fc", surface: "#ffffff", text: "#0f172a", muted: "#64748b", accent: "#2563eb", accentContrast: "#ffffff", border: "#e2e8f0" }, swatch: ["#f7f9fc", "#2563eb", "#0f172a"] },
    { id: "sand", name: "Sand & terracotta", vars: { bg: "#f8f3ea", surface: "#ffffff", text: "#2b2117", muted: "#7c6b5a", accent: "#b65a3a", accentContrast: "#ffffff", border: "#e9dfd0" }, swatch: ["#f8f3ea", "#b65a3a", "#2b2117"] },
    { id: "olive", name: "Olive", vars: { bg: "#f6f7f2", surface: "#ffffff", text: "#1f2a1c", muted: "#687462", accent: "#5f7a3a", accentContrast: "#ffffff", border: "#e0e5d8" }, swatch: ["#f6f7f2", "#5f7a3a", "#1f2a1c"] },
  ],
  fontPairings: [
    { id: "manrope", name: "Manrope", display: "manrope", body: "dm-sans" },
    { id: "josefin-manrope", name: "Josefin & Manrope", display: "josefin", body: "manrope" },
    { id: "fraunces-dm", name: "Fraunces & DM Sans", display: "fraunces", body: "dm-sans" },
  ],
  defaults: { paletteId: "mono", fontPairingId: "manrope" },
  previewGradient: "linear-gradient(135deg, #ffffff 0%, #f0f0ec 100%)",
  component: ModernMinimal,
};

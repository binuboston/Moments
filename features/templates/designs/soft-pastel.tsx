import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import { Branding, CalendarActions, Contacts, Countdown, EventDetails, Gallery, Gifts, RsvpForm, Schedule, Section } from "@/features/templates/sections";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";
import { CoverImage, kindDetails, HeroTitle } from "@/features/templates/designs/shared";

function Blob({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M47.7,-56.6C60.8,-47.1,69.6,-30.5,72.5,-13.1C75.5,4.3,72.6,22.5,63.1,36.8C53.6,51.1,37.5,61.5,20.5,66.4C3.5,71.3,-14.4,70.7,-30.3,64.1C-46.2,57.5,-60.1,44.9,-66.8,29.3C-73.5,13.7,-73,-4.9,-66.5,-20.6C-60,-36.3,-47.5,-49.1,-33.3,-57.1C-19.1,-65.1,-3.2,-68.3,11.6,-66.9C26.4,-65.5,34.6,-66.1,47.7,-56.6Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

function SoftPastel({ view, theme, mode }: TemplateProps) {
  const { content, media } = view;
  const details = kindDetails(view);
  const s = theme.sections;

  return (
    <article className="relative mx-auto w-full max-w-3xl overflow-hidden">
      <Blob className="absolute -top-20 -left-24 size-72 text-(--inv-c2) opacity-70 sm:size-96" />
      <Blob className="absolute top-72 -right-28 size-72 text-(--inv-c3) opacity-60 sm:size-96" />

      <header className="relative px-6 pt-16 pb-12 text-center sm:px-12 sm:pt-24">
        <p className="inline-flex rounded-full bg-(--inv-surface) px-4 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase text-(--inv-accent) shadow-sm">{details.eyebrow}</p>
        <HeroTitle view={view} className="inv-display mt-8 text-5xl leading-[1.05] text-balance sm:text-6xl" headlineClassName="font-medium text-(--inv-accent)" />
        {content.subheading ? <p className="mt-4 text-lg text-(--inv-muted)">{content.subheading}</p> : null}
        <div className="mx-auto mt-8 inline-flex flex-col rounded-[2rem] bg-(--inv-surface)/80 px-8 py-5 shadow-sm backdrop-blur">
          <span className="text-base font-semibold">{formatEventDate(content.startsAt, content.timezone)}</span>
          <span className="text-sm text-(--inv-muted)">{formatTimeRange(content.startsAt, content.endsAt, content.timezone)}</span>
        </div>
      </header>

      {media.cover ? (
        <div className="relative mx-8 aspect-[4/5] overflow-hidden rounded-[45%_55%_50%_50%/55%_45%_55%_45%] sm:mx-24">
          <CoverImage media={media.cover} priority />
        </div>
      ) : null}

      {s.intro ? (
        <Section className="relative">
          {content.hosts ? <p className="mb-3 text-sm text-(--inv-muted)">{content.hosts}</p> : null}
          {content.intro ? <p className="mx-auto max-w-xl text-lg leading-relaxed text-pretty">{content.intro}</p> : null}
          {details.lines.length ? <p className="mt-4 text-sm font-medium text-(--inv-accent)">{details.lines.join(" · ")}</p> : null}
        </Section>
      ) : null}

      {s.countdown ? (
        <Section eyebrow="Almost time" className="relative pt-0">
          <Countdown targetIso={content.startsAt} className="mx-auto max-w-lg" cellClassName="rounded-3xl border-0 bg-(--inv-surface)/80 shadow-sm" />
        </Section>
      ) : null}

      {s.details ? (
        <Section eyebrow="Details" title="Where & when" className="relative">
          <div className="mx-auto max-w-xl rounded-[2.5rem] bg-(--inv-surface)/80 p-8 shadow-sm backdrop-blur sm:p-10">
            <EventDetails view={view} layout="row" />
            {content.dressCode ? <p className="mt-6 text-sm text-(--inv-muted)">Dress code: {content.dressCode}</p> : null}
          </div>
          <CalendarActions view={view} className="mt-6" buttonClassName="border-0 bg-(--inv-surface)/80 shadow-sm" />
        </Section>
      ) : null}

      {s.schedule ? (
        <Section eyebrow="Plan" title="The day" className="relative">
          <Schedule functions={view.functions} variant="cards" itemClassName="rounded-[2rem] border-0 bg-(--inv-surface)/80 shadow-sm" />
        </Section>
      ) : null}

      {s.gallery ? (
        <Section eyebrow="Photos" title="Little moments" className="relative">
          <Gallery items={media.gallery} rounded="rounded-[2rem]" />
        </Section>
      ) : null}

      {s.rsvp ? (
        <Section eyebrow="Join us" title="RSVP" className="relative">
          <RsvpForm slug={view.slug} settings={view.settings.rsvp} timezone={content.timezone} mode={mode} />
        </Section>
      ) : null}

      {s.gifts ? (
        <Section eyebrow="Gifts" className="relative">
          <Gifts gifts={content.gifts} />
        </Section>
      ) : null}

      {s.contacts ? (
        <Section eyebrow="Questions" title="Get in touch" className="relative">
          <Contacts contacts={content.contacts} className="[&>li]:border-0 [&>li]:bg-(--inv-surface)/80 [&>li]:shadow-sm" />
        </Section>
      ) : null}

      {s.message ? (
        <Section className="relative">
          <p className="inv-display mx-auto max-w-lg text-2xl leading-relaxed text-pretty sm:text-3xl">{content.message}</p>
        </Section>
      ) : null}

      <Branding show={view.showBranding} className="relative" />
    </article>
  );
}

export const softPastel: TemplateDefinition = {
  key: "soft-pastel",
  name: "Soft Pastel",
  description: "Gentle pastel washes and rounded shapes. Warm and welcoming for showers and family celebrations.",
  categories: ["baby-shower", "birthday", "housewarming"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "gallery", "rsvp", "contacts", "gifts", "message"],
  palettes: [
    { id: "peach", name: "Peach", vars: { bg: "#fff6f0", surface: "#ffffff", text: "#3b2f2a", muted: "#8a7570", accent: "#e07a5f", accentContrast: "#ffffff", border: "#f3e1d8" }, swatch: ["#fff6f0", "#e07a5f", "#fde2cf"] },
    { id: "mint", name: "Mint", vars: { bg: "#f1faf6", surface: "#ffffff", text: "#23352d", muted: "#6d8278", accent: "#3f8f6b", accentContrast: "#ffffff", border: "#d8ebe2" }, swatch: ["#f1faf6", "#3f8f6b", "#cdeedd"] },
    { id: "lilac", name: "Lilac", vars: { bg: "#f8f4fc", surface: "#ffffff", text: "#332a3f", muted: "#7c6f8a", accent: "#8b6cc1", accentContrast: "#ffffff", border: "#e7dcf2" }, swatch: ["#f8f4fc", "#8b6cc1", "#e5d7f5"] },
    { id: "sky", name: "Sky", vars: { bg: "#f2f8fd", surface: "#ffffff", text: "#24323f", muted: "#6c7d8e", accent: "#4a8fd1", accentContrast: "#ffffff", border: "#dbe8f4" }, swatch: ["#f2f8fd", "#4a8fd1", "#d4e7f8"] },
  ],
  fontPairings: [
    { id: "fraunces-dm", name: "Fraunces & DM Sans", display: "fraunces", body: "dm-sans" },
    { id: "lora-manrope", name: "Lora & Manrope", display: "lora", body: "manrope" },
  ],
  defaults: { paletteId: "peach", fontPairingId: "fraunces-dm" },
  previewGradient: "linear-gradient(135deg, #fff6f0 0%, #fde2cf 50%, #e5d7f5 100%)",
  component: SoftPastel,
};

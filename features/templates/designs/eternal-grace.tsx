import { cn } from "@/lib/utils/cn";
import { formatEventDate } from "@/lib/utils/dates";
import { Branding, CalendarActions, Contacts, Countdown, EventDetails, Gallery, Gifts, RsvpForm, Schedule, Section , SaveTheDate, ShareMoments } from "@/features/templates/sections";
import { titleParts } from "@/features/templates/title";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";
import { CoverImage, RuleOrnament, kindDetails, monogram, HeroTitle , Invocation, shareData } from "@/features/templates/designs/shared";

function EternalGrace({ view, theme, mode }: TemplateProps) {
  const { content, media } = view;
  const details = kindDetails(view);
  const s = theme.sections;
  // Chapter numbers follow the sections that are actually shown.
  let chapter = 0;
  const next = () => ++chapter;

  return (
    <article className="mx-auto w-full max-w-3xl">
      {/* Hero */}
      <header className="relative px-6 pt-14 pb-12 text-center sm:px-12 sm:pt-20">
        <div className="pointer-events-none absolute inset-4 rounded-t-[999px] rounded-b-[2rem] border border-(--inv-accent)/40 sm:inset-6" aria-hidden data-inv-hero />
        <div className="pointer-events-none absolute inset-6 rounded-t-[999px] rounded-b-[1.75rem] border border-(--inv-border)/70 sm:inset-8" aria-hidden />
        <div className="relative pt-10 sm:pt-14">
          <Invocation view={view} />
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full border border-(--inv-accent) text-(--inv-accent)" data-inv-hero>
            <span className="inv-display text-xl tracking-[0.15em]">{monogram(view)}</span>
          </div>
          {content.hosts ? (
            <p className="mx-auto max-w-md text-sm italic text-(--inv-muted) text-pretty" data-inv-hero>
              {content.hosts}
            </p>
          ) : null}
          <p className="mt-4 text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-(--inv-accent)" data-inv-hero>
            {details.eyebrow}
          </p>
          <HeroTitle view={view} className="inv-display mt-4 text-5xl leading-[1.05] text-balance sm:text-7xl" headlineClassName="inv-display italic text-xl text-(--inv-muted)" />
          {content.subheading ? (
            <p className="inv-display mt-4 text-xl italic text-(--inv-muted) sm:text-2xl" data-inv-hero>
              {content.subheading}
            </p>
          ) : null}
          <RuleOrnament className="mt-8" />
          <p className="mt-6 text-sm tracking-[0.24em] uppercase sm:text-base" data-inv-hero>
            {formatEventDate(content.startsAt, content.timezone)}
          </p>
          {content.venue.name ? (
            <p className="mt-1 text-sm text-(--inv-muted) italic" data-inv-hero>
              {content.venue.name}
            </p>
          ) : null}
        </div>
      </header>

      {media.cover ? (
        <div className="relative mx-6 aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-2xl ring-1 ring-(--inv-accent)/30 ring-offset-8 ring-offset-(--inv-bg) sm:mx-16 sm:aspect-[3/4]" data-inv-reveal="mask">
          <CoverImage media={media.cover} priority />
        </div>
      ) : null}

      {s.intro ? (
        <Section>
          {details.lines.length > 0 ? (
            <div className="mb-6 flex flex-col items-center gap-1 text-sm text-(--inv-muted) sm:flex-row sm:justify-center sm:gap-6" data-inv-reveal>
              {details.lines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          ) : null}
          {content.intro ? <p data-inv-reveal className="inv-display mx-auto max-w-xl text-xl leading-relaxed text-pretty sm:text-2xl">{content.intro}</p> : null}
        </Section>
      ) : null}

      {s.countdown ? (
        <Section className="border-t border-(--inv-border)">
          <SaveTheDate view={view} titleClassName="italic text-(--inv-accent)" />
          <p className="mt-16 mb-6 text-[0.7rem] font-semibold tracking-[0.28em] uppercase text-(--inv-accent)" data-inv-reveal>
            Counting down
          </p>
          <Countdown targetIso={content.startsAt} endIso={content.endsAt} className="mx-auto max-w-lg" cellClassName="rounded-none border-x-0 border-t-0 bg-transparent" />
        </Section>
      ) : null}

      {s.details ? (
        <Section id="details" index={next()} eyebrow="The details" title="When & where" className="border-t border-(--inv-border)">
          <EventDetails view={view} layout="row" />
          {content.dressCode ? <p data-inv-reveal className="mt-8 text-sm italic text-(--inv-muted)">Dress code: {content.dressCode}</p> : null}
          <CalendarActions view={view} className="mt-8" />
        </Section>
      ) : null}

      {s.schedule ? (
        <Section id="schedule" index={next()} eyebrow="Celebrations" title="Order of events" className="border-t border-(--inv-border)">
          <Schedule functions={view.functions} />
        </Section>
      ) : null}

      {s.gallery ? (
        <Section id="gallery" index={next()} eyebrow="Moments" title="Our story in pictures" className="border-t border-(--inv-border)">
          <Gallery items={media.gallery} rounded="rounded-2xl" />
        </Section>
      ) : null}

      {s.rsvp ? (
        <Section id="rsvp" index={next()} eyebrow="Kindly respond" title="RSVP" className="border-t border-(--inv-border)">
          <RsvpForm slug={view.slug} settings={view.settings.rsvp} timezone={content.timezone} mode={mode} />
        </Section>
      ) : null}

      {s.gifts ? (
        <Section eyebrow="Gifts" className="border-t border-(--inv-border)">
          <Gifts gifts={content.gifts} />
        </Section>
      ) : null}

      {s.contacts ? (
        <Section eyebrow="Questions" title="Get in touch" className="border-t border-(--inv-border)">
          <Contacts contacts={content.contacts} />
        </Section>
      ) : null}

      {s.message ? (
        <Section className="bg-(--inv-text) py-20 text-(--inv-bg) sm:py-28">
          <RuleOrnament className="mb-8" />
          <p data-inv-reveal className="inv-display mx-auto max-w-lg text-3xl italic leading-snug text-pretty sm:text-4xl">
            {content.message}
          </p>
          <p className="mt-8 text-[0.7rem] tracking-[0.28em] uppercase text-(--inv-accent)" data-inv-reveal>
            With love, {titleParts(content).title}
          </p>
        </Section>
      ) : null}

      <ShareMoments hashtag={content.hashtag} share={shareData(view)} className="px-6 py-16 sm:py-20" />

      <Branding show={view.showBranding} className={cn(!s.message && "pt-8")} />
    </article>
  );
}

export const eternalGrace: TemplateDefinition = {
  key: "eternal-grace",
  name: "Eternal Grace",
  description: "Classic serif typography, soft ivory paper and a restrained gold rule. Timeless for weddings and engagements.",
  categories: ["wedding", "engagement", "anniversary"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  palettes: [
    { id: "ivory", name: "Ivory & gold", vars: { bg: "#fbf8f1", surface: "#ffffff", text: "#2b2622", muted: "#7a7067", accent: "#b8955a", accentContrast: "#ffffff", border: "#e8dfcf" }, swatch: ["#fbf8f1", "#b8955a", "#2b2622"] },
    { id: "blush", name: "Blush", vars: { bg: "#fbf3f1", surface: "#ffffff", text: "#3a2a2a", muted: "#8c6f70", accent: "#b86a6e", accentContrast: "#ffffff", border: "#eedad6" }, swatch: ["#fbf3f1", "#b86a6e", "#3a2a2a"] },
    { id: "sage", name: "Sage", vars: { bg: "#f4f6f1", surface: "#ffffff", text: "#27302a", muted: "#6f7a70", accent: "#6f8a6a", accentContrast: "#ffffff", border: "#dce3d6" }, swatch: ["#f4f6f1", "#6f8a6a", "#27302a"] },
    { id: "slate", name: "Slate", vars: { bg: "#f3f4f6", surface: "#ffffff", text: "#232833", muted: "#6b7280", accent: "#4a5a7a", accentContrast: "#ffffff", border: "#dde1e8" }, swatch: ["#f3f4f6", "#4a5a7a", "#232833"] },
  ],
  fontPairings: [
    { id: "cormorant-lora", name: "Cormorant & Lora", display: "cormorant", body: "lora" },
    { id: "playfair-dm", name: "Playfair & DM Sans", display: "playfair", body: "dm-sans" },
    { id: "script-lora", name: "Great Vibes & Lora", display: "great-vibes", body: "lora" },
  ],
  defaults: { paletteId: "ivory", fontPairingId: "cormorant-lora" },
  previewGradient: "linear-gradient(135deg, #fbf8f1 0%, #efe4cf 100%)",
  particles: "petals",
  component: EternalGrace,
};

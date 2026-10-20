import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import { Branding, CalendarActions, Contacts, Countdown, EventDetails, Gallery, Gifts, RsvpForm, Schedule, Section , SaveTheDate, ShareMoments } from "@/features/templates/sections";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";
import { Confetti, CoverImage, kindDetails, HeroTitle , Invocation, shareData } from "@/features/templates/designs/shared";

function ConfettiPop({ view, theme, mode }: TemplateProps) {
  const { content, media } = view;
  const details = kindDetails(view);
  const s = theme.sections;

  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="relative overflow-hidden px-6 pt-16 pb-14 text-center sm:px-12 sm:pt-24">
        <Confetti />
        <div className="relative">
          <Invocation view={view} className="font-semibold" />
          <div data-inv-hero>
            <span className="inline-flex rounded-full bg-(--inv-accent) px-4 py-1.5 text-xs font-bold tracking-[0.12em] uppercase text-(--inv-accent-contrast)">{details.eyebrow}</span>
          </div>
          <HeroTitle view={view} className="inv-display mt-8 text-5xl leading-[1] font-bold tracking-tight text-balance sm:text-7xl" headlineClassName="font-semibold text-(--inv-muted)" />
          {content.subheading ? (
            <p className="mt-5 text-xl font-medium text-(--inv-muted)" data-inv-hero>
              {content.subheading}
            </p>
          ) : null}
          <div data-inv-hero className="mx-auto mt-10 inline-flex flex-col gap-1 rounded-3xl border-2 border-(--inv-text) bg-(--inv-surface) px-8 py-5 shadow-[6px_6px_0_0_var(--inv-c2)]">
            <span className="text-lg font-bold">{formatEventDate(content.startsAt, content.timezone)}</span>
            <span className="text-sm font-medium text-(--inv-muted)">{formatTimeRange(content.startsAt, content.endsAt, content.timezone)}</span>
          </div>
        </div>
      </header>

      {media.cover ? (
        <div className="relative mx-6 aspect-square overflow-hidden rounded-[2.5rem] border-2 border-(--inv-text) shadow-[10px_10px_0_0_var(--inv-c3)] sm:mx-16" data-inv-reveal="mask">
          <CoverImage media={media.cover} priority />
        </div>
      ) : null}

      {s.intro ? (
        <Section>
          {content.hosts ? (
            <p className="mb-3 text-sm font-semibold text-(--inv-muted)" data-inv-reveal>
              {content.hosts}
            </p>
          ) : null}
          {content.intro ? <p data-inv-reveal className="mx-auto max-w-xl text-lg leading-relaxed text-pretty sm:text-xl">{content.intro}</p> : null}
          {details.lines.length ? <p data-inv-reveal className="mt-4 text-sm text-(--inv-muted)">{details.lines.join(" · ")}</p> : null}
        </Section>
      ) : null}

      {s.countdown ? (
        <Section>
          <SaveTheDate
            view={view}
            title="Save the date!"
            titleClassName="font-bold tracking-tight"
            cardClassName="rounded-3xl border-2 border-(--inv-text) shadow-[6px_6px_0_0_var(--inv-c2)]"
          />
          <p className="mt-16 mb-6 text-[0.7rem] font-bold tracking-[0.2em] uppercase" data-inv-reveal>
            Party starts in
          </p>
          <Countdown targetIso={content.startsAt} endIso={content.endsAt} className="mx-auto max-w-lg" cellClassName="rounded-2xl border-2 border-(--inv-text) bg-(--inv-surface) shadow-[4px_4px_0_0_var(--inv-accent)]" numberClassName="font-bold" />
        </Section>
      ) : null}

      {s.details ? (
        <Section id="details" eyebrow="Where to find us" title="The details" eyebrowClassName="text-(--inv-text)">
          <div className="mx-auto max-w-xl rounded-[2rem] bg-(--inv-surface) p-8" data-inv-reveal>
            <EventDetails view={view} layout="row" />
            {content.dressCode ? <p data-inv-reveal className="mt-6 text-sm font-medium text-(--inv-muted)">Wear: {content.dressCode}</p> : null}
          </div>
          <CalendarActions view={view} className="mt-6" buttonClassName="border-2 border-(--inv-text) font-semibold" />
        </Section>
      ) : null}

      {s.schedule ? (
        <Section id="schedule" eyebrow="Plan" title="What's happening" eyebrowClassName="text-(--inv-text)">
          <Schedule functions={view.functions} variant="cards" itemClassName="rounded-3xl border-2 border-(--inv-text)" />
        </Section>
      ) : null}

      {s.gallery ? (
        <Section id="gallery" eyebrow="Photos" title="Memories" eyebrowClassName="text-(--inv-text)">
          <Gallery items={media.gallery} rounded="rounded-3xl" />
        </Section>
      ) : null}

      {s.rsvp ? (
        <Section id="rsvp" eyebrow="Are you in?" title="RSVP" eyebrowClassName="text-(--inv-text)">
          <RsvpForm slug={view.slug} settings={view.settings.rsvp} timezone={content.timezone} mode={mode} />
        </Section>
      ) : null}

      {s.gifts ? (
        <Section eyebrow="Gifts" eyebrowClassName="text-(--inv-text)">
          <Gifts gifts={content.gifts} />
        </Section>
      ) : null}

      {s.contacts ? (
        <Section eyebrow="Questions?" title="Say hello" eyebrowClassName="text-(--inv-text)">
          <Contacts contacts={content.contacts} />
        </Section>
      ) : null}

      {s.message ? (
        <Section className="relative overflow-hidden">
          <Confetti className="opacity-60" />
          <p data-inv-reveal className="inv-display relative mx-auto max-w-lg text-3xl font-bold leading-tight text-pretty">{content.message}</p>
        </Section>
      ) : null}

      <ShareMoments hashtag={content.hashtag} share={shareData(view)} className="px-6 py-16 sm:py-20" />

      <Branding show={view.showBranding} />
    </article>
  );
}

export const confettiPop: TemplateDefinition = {
  key: "confetti-pop",
  name: "Confetti Pop",
  description: "Bright, joyful and playful with floating confetti. Made for birthdays, showers and parties.",
  categories: ["birthday", "baby-shower", "party"],
  tier: "free",
  sections: ["hero", "intro", "countdown", "details", "schedule", "gallery", "rsvp", "contacts", "gifts", "message"],
  defaultSections: ["hero", "intro", "countdown", "details", "gallery", "rsvp", "contacts", "message"],
  palettes: [
    { id: "candy", name: "Candy", vars: { bg: "#fff8f0", surface: "#ffffff", text: "#1f1b2e", muted: "#6c6680", accent: "#ff5c8a", accentContrast: "#ffffff", border: "#f3e3e8" }, swatch: ["#fff8f0", "#ff5c8a", "#ffd166"] },
    { id: "citrus", name: "Citrus", vars: { bg: "#fffdf2", surface: "#ffffff", text: "#1e2a1e", muted: "#6b7566", accent: "#f59e0b", accentContrast: "#1e2a1e", border: "#f0ead6" }, swatch: ["#fffdf2", "#f59e0b", "#84cc16"] },
    { id: "ocean", name: "Ocean", vars: { bg: "#f0f9ff", surface: "#ffffff", text: "#0c1f33", muted: "#5a7088", accent: "#0ea5e9", accentContrast: "#ffffff", border: "#dbeafe" }, swatch: ["#f0f9ff", "#0ea5e9", "#f472b6"] },
    { id: "berry", name: "Berry", vars: { bg: "#fdf4ff", surface: "#ffffff", text: "#2a1033", muted: "#7a5a85", accent: "#a855f7", accentContrast: "#ffffff", border: "#f0dcf6" }, swatch: ["#fdf4ff", "#a855f7", "#fb7185"] },
  ],
  fontPairings: [
    { id: "poppins", name: "Poppins", display: "poppins", body: "dm-sans" },
    { id: "fraunces-poppins", name: "Fraunces & Poppins", display: "fraunces", body: "poppins" },
  ],
  defaults: { paletteId: "candy", fontPairingId: "poppins" },
  previewGradient: "linear-gradient(135deg, #fff8f0 0%, #ffe3ec 60%, #fff1c6 100%)",
  particles: "confetti",
  component: ConfettiPop,
};

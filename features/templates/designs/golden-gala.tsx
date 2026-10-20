import { formatEventDate, formatTimeRange } from "@/lib/utils/dates";
import { Branding, CalendarActions, Contacts, Countdown, EventDetails, Gallery, Gifts, RsvpForm, Schedule, Section , SaveTheDate, ShareMoments } from "@/features/templates/sections";
import type { TemplateDefinition, TemplateProps } from "@/features/templates/types";
import { CoverImage, DecoCorner, kindDetails, monogram, HeroTitle , Invocation, shareData } from "@/features/templates/designs/shared";

function GoldenGala({ view, theme, mode }: TemplateProps) {
  const { content, media } = view;
  const details = kindDetails(view);
  const s = theme.sections;
  let chapter = 0;
  const next = () => ++chapter;

  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="relative px-6 pt-14 pb-14 text-center sm:px-12 sm:pt-20">
        <DecoCorner className="absolute top-4 left-4" />
        <DecoCorner className="absolute top-4 right-4 rotate-90" />
        <DecoCorner className="absolute bottom-4 left-4 -rotate-90" />
        <DecoCorner className="absolute right-4 bottom-4 rotate-180" />
        <Invocation view={view} />
        <div className="mx-auto mb-8 flex w-fit" data-inv-hero>
          <div className="inline-flex size-20 items-center justify-center bg-(--inv-accent) text-(--inv-accent-contrast)" style={{ clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" }}>
            <span className="inv-display text-lg tracking-[0.2em]">{monogram(view)}</span>
          </div>
        </div>
        <p className="text-[0.7rem] font-medium tracking-[0.36em] uppercase text-(--inv-accent)" data-inv-hero>
          {details.eyebrow}
        </p>
        <HeroTitle view={view} className="inv-display mt-6 text-5xl leading-[1.05] tracking-[0.04em] uppercase text-balance sm:text-6xl" headlineClassName="text-xs tracking-[0.24em] uppercase text-(--inv-muted)" />
        {content.subheading ? (
          <p className="mt-5 text-sm tracking-[0.2em] uppercase text-(--inv-muted)" data-inv-hero>
            {content.subheading}
          </p>
        ) : null}
        <div className="mx-auto mt-10 flex justify-center" aria-hidden data-inv-reveal="draw">
          <span className="h-px w-24 bg-(--inv-accent)" data-line />
        </div>
        <p className="mt-6 text-lg tracking-wide" data-inv-hero>
          {formatEventDate(content.startsAt, content.timezone)}
        </p>
        <p className="mt-1 text-sm text-(--inv-muted)" data-inv-hero>
          {formatTimeRange(content.startsAt, content.endsAt, content.timezone)}
        </p>
      </header>

      {media.cover ? (
        <div className="relative mx-6 aspect-[3/4] overflow-hidden border border-(--inv-accent)/50 p-2 sm:mx-12">
          <div className="relative h-full w-full overflow-hidden" data-inv-reveal="mask">
            <CoverImage media={media.cover} priority />
          </div>
        </div>
      ) : null}

      {s.intro ? (
        <Section>
          {content.hosts ? <p className="mb-4 text-xs tracking-[0.2em] uppercase text-(--inv-muted)">{content.hosts}</p> : null}
          {content.intro ? <p data-inv-reveal className="inv-display mx-auto max-w-xl text-xl leading-relaxed text-pretty sm:text-2xl">{content.intro}</p> : null}
          {details.lines.length ? (
            <ul className="mt-8 inline-flex flex-col gap-2 border-y border-(--inv-accent)/40 py-4 text-sm tracking-wide text-(--inv-muted)" data-inv-reveal>
              {details.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          ) : null}
        </Section>
      ) : null}

      {s.countdown ? (
        <Section>
          <SaveTheDate view={view} titleClassName="uppercase tracking-[0.08em] text-4xl sm:text-5xl" cardClassName="rounded-none border-(--inv-accent)/40 bg-transparent shadow-none" />
          <div className="mx-auto mt-16 mb-6 h-px w-24 bg-(--inv-accent)/60" aria-hidden />
          <Countdown targetIso={content.startsAt} endIso={content.endsAt} className="mx-auto max-w-lg" cellClassName="rounded-none border-(--inv-accent)/40 bg-transparent" numberClassName="text-(--inv-accent)" />
        </Section>
      ) : null}

      {s.details ? (
        <Section id="details" index={next()} eyebrow="Evening details" title="When & where" titleClassName="uppercase tracking-[0.08em] text-2xl sm:text-3xl">
          <div className="mx-auto max-w-xl border border-(--inv-accent)/40 p-8 sm:p-10">
            <EventDetails view={view} />
            {content.dressCode ? <p data-inv-reveal className="mt-6 text-xs tracking-[0.2em] uppercase text-(--inv-muted)">Dress code · {content.dressCode}</p> : null}
          </div>
          <CalendarActions view={view} className="mt-6" buttonClassName="rounded-none border-(--inv-accent)/40 uppercase tracking-[0.12em] text-xs" />
        </Section>
      ) : null}

      {s.schedule ? (
        <Section id="schedule" index={next()} eyebrow="Programme" title="Order of the evening" titleClassName="uppercase tracking-[0.08em] text-2xl sm:text-3xl">
          <Schedule functions={view.functions} />
        </Section>
      ) : null}

      {s.gallery ? (
        <Section id="gallery" index={next()} eyebrow="Gallery" title="Highlights" titleClassName="uppercase tracking-[0.08em] text-2xl sm:text-3xl">
          <Gallery items={media.gallery} rounded="rounded-none" />
        </Section>
      ) : null}

      {s.rsvp ? (
        <Section id="rsvp" index={next()} eyebrow="Reply" title="Kindly respond" titleClassName="uppercase tracking-[0.08em] text-2xl sm:text-3xl">
          <RsvpForm slug={view.slug} settings={view.settings.rsvp} timezone={content.timezone} mode={mode} />
        </Section>
      ) : null}

      {s.gifts ? (
        <Section eyebrow="Gifts">
          <Gifts gifts={content.gifts} />
        </Section>
      ) : null}

      {s.contacts ? (
        <Section eyebrow="Enquiries" title="Contact" titleClassName="uppercase tracking-[0.08em] text-2xl sm:text-3xl">
          <Contacts contacts={content.contacts} />
        </Section>
      ) : null}

      {s.message ? (
        <Section>
          <div className="mx-auto mb-6 flex justify-center" aria-hidden data-inv-reveal="draw">
            <span className="h-px w-24 bg-(--inv-accent)" data-line />
          </div>
          <p data-inv-reveal className="inv-display mx-auto max-w-lg text-2xl leading-relaxed text-pretty">{content.message}</p>
        </Section>
      ) : null}

      <ShareMoments hashtag={content.hashtag} share={shareData(view)} className="px-6 py-16 sm:py-20" />

      <Branding show={view.showBranding} />
    </article>
  );
}

export const goldenGala: TemplateDefinition = {
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
  ],
  fontPairings: [
    { id: "cormorant-josefin", name: "Cormorant & Josefin", display: "cormorant", body: "josefin" },
    { id: "playfair-montserrat", name: "Playfair & Montserrat", display: "playfair", body: "montserrat" },
  ],
  defaults: { paletteId: "midnight-gold", fontPairingId: "cormorant-josefin" },
  previewGradient: "linear-gradient(160deg, #0f0f12 0%, #2a2318 100%)",
  particles: "sparkles",
  component: GoldenGala,
};

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Branding, CalendarActions, Contacts, Countdown, EventDetails, Gallery, Gifts, RsvpForm, SaveTheDate, Schedule, Section, ShareMoments } from "@/features/templates/sections";
import { kindDetails, shareData } from "@/features/templates/designs/shared";
import { titleParts } from "@/features/templates/title";
import type { TemplateProps } from "@/features/templates/types";
import type { HeadedSection, SectionCopy, TemplateRecipe } from "@/features/templates/compose/recipe";

const LABEL = "text-[0.7rem] font-semibold tracking-[0.2em] uppercase text-(--inv-accent)";

/** Editorial row: a small label beside the content on wide screens (or above it), ruled from the row before. */
function SidebarFrame({ id, copy, ruled = true, children }: { id?: string; copy: SectionCopy; ruled?: boolean; children: ReactNode }) {
  const label = copy.note ? (
    <div className="mb-6 sm:mb-0">
      <p className={LABEL}>{copy.label}</p>
      <p className="mt-2 text-sm text-(--inv-muted)">{copy.note}</p>
    </div>
  ) : copy.label ? (
    <p className={cn(copy.side ? "mb-4 sm:mb-0" : "mb-6", LABEL)} data-inv-reveal>
      {copy.label}
    </p>
  ) : null;
  return (
    <Section id={id} align="left" className={cn(ruled && "border-t border-(--inv-border)", copy.side && "sm:grid sm:grid-cols-[1fr_2fr] sm:gap-10")}>
      {label}
      {copy.side ? <div>{children}</div> : children}
    </Section>
  );
}

/**
 * The one page skeleton every recipe-based template renders through. Section
 * order, the ids the quick-action dock links to (#details, #rsvp), chapter
 * numbering and motion attributes are defined here once; recipes only choose
 * the look.
 */
export function ComposedTemplate({ recipe: r, view, theme, mode }: TemplateProps & { recipe: TemplateRecipe }) {
  const { content, media } = view;
  const details = kindDetails(view);
  const s = theme.sections;
  const c = r.chapter;
  // Chapter numbers follow the sections that are actually shown.
  let chapter = 0;
  const next = () => (c.frame === "headed" && c.numbered ? ++chapter : undefined);

  const headed = (kind: HeadedSection, children: ReactNode, opts: { id?: string; numbered?: boolean } = {}) => {
    const copy = r.copy[kind];
    if (c.frame === "sidebar") return <SidebarFrame id={opts.id} copy={copy}>{children}</SidebarFrame>;
    return (
      <Section
        id={opts.id}
        index={opts.numbered ? next() : undefined}
        eyebrow={copy.eyebrow}
        title={copy.title}
        align={c.align}
        className={c.className}
        titleClassName={copy.title ? c.titleClassName : undefined}
        eyebrowClassName={c.eyebrowClassName}
      >
        {children}
      </Section>
    );
  };
  const plain = (kind: "intro" | "countdown", children: ReactNode) =>
    c.frame === "sidebar" ? (
      kind === "intro" ? (
        <SidebarFrame copy={c.intro} ruled={false}>
          {children}
        </SidebarFrame>
      ) : (
        <Section align="left" className="border-t border-(--inv-border)">
          {children}
        </Section>
      )
    ) : (
      <Section align={c.align} className={kind === "intro" ? c.introClassName : c.countdownClassName}>
        {children}
      </Section>
    );

  // Intro: hosts, the welcome (lit word by word on the guest page) and category lines.
  const hosts =
    r.intro.hosts && content.hosts ? (
      <p className={r.intro.hosts.className} data-inv-reveal={r.intro.hosts.reveal ? true : undefined}>
        {content.hosts}
      </p>
    ) : null;
  const welcome = content.intro ? (
    <p data-inv-reveal="words" className={r.intro.textClassName}>
      {content.intro}
    </p>
  ) : null;
  const L = r.intro.lines;
  const lines = !details.lines.length ? null : L.as === "p" ? (
    <p data-inv-reveal className={L.className}>
      {details.lines.join(" · ")}
    </p>
  ) : L.as === "ul" ? (
    <ul className={L.className} data-inv-reveal>
      {details.lines.map((l) => (
        <li key={l}>{l}</li>
      ))}
    </ul>
  ) : (
    <div className={L.className} data-inv-reveal>
      {details.lines.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );

  const d = r.details;
  const dress = content.dressCode ? (
    <p data-inv-reveal className={d.dressCode.className}>
      {d.dressCode.format(content.dressCode)}
    </p>
  ) : null;
  const eventDetails = <EventDetails view={view} {...d.event} />;

  const share = <ShareMoments hashtag={content.hashtag} share={shareData(view)} className={r.share.className} />;
  const brandingClass = typeof r.branding?.className === "function" ? r.branding.className(s) : r.branding?.className;
  const branding = <Branding show={view.showBranding} className={brandingClass} />;
  const Tail = r.Tail;

  return (
    <article className={cn("mx-auto w-full max-w-3xl", r.article)}>
      {r.Backdrop ? <r.Backdrop /> : null}
      <r.Hero view={view} theme={theme} mode={mode} />

      {media.cover ? <r.Cover media={media.cover} /> : r.NoCover ? <r.NoCover /> : null}

      {s.intro
        ? plain(
            "intro",
            r.intro.order === "lines-text" ? (
              <>
                {lines}
                {welcome}
              </>
            ) : (
              <>
                {hosts}
                {welcome}
                {lines}
              </>
            ),
          )
        : null}

      {s.countdown
        ? plain(
            "countdown",
            <>
              <SaveTheDate view={view} {...r.countdown.saveTheDate} />
              {r.countdown.between}
              <Countdown targetIso={content.startsAt} endIso={content.endsAt} {...r.countdown.countdown} />
            </>,
          )
        : null}

      {s.details
        ? headed(
            "details",
            <>
              {d.panel ? (
                <div className={d.panel.className} data-inv-reveal={d.panel.reveal ? true : undefined}>
                  {eventDetails}
                  {dress}
                </div>
              ) : (
                <>
                  {eventDetails}
                  {dress}
                </>
              )}
              <CalendarActions view={view} {...d.calendar} />
            </>,
            { id: "details", numbered: true },
          )
        : null}

      {s.schedule ? headed("schedule", <Schedule functions={view.functions} {...r.schedule} />, { id: "schedule", numbered: true }) : null}

      {s.gallery ? headed("gallery", <Gallery items={media.gallery} layout={theme.gallery} rounded={r.gallery.rounded} />, { id: "gallery", numbered: true }) : null}

      {s.rsvp ? headed("rsvp", <RsvpForm slug={view.slug} settings={view.settings.rsvp} timezone={content.timezone} mode={mode} className={r.rsvp?.className} />, { id: "rsvp", numbered: true }) : null}

      {s.gifts ? headed("gifts", <Gifts gifts={content.gifts} className={r.gifts?.className} />) : null}

      {s.contacts ? headed("contacts", <Contacts contacts={content.contacts} className={r.contacts?.className} />) : null}

      {s.message ? (
        <Section align={r.closing.align} className={r.closing.className}>
          {r.closing.Ornament ? <r.closing.Ornament /> : null}
          <p data-inv-reveal="words" className={r.closing.textClassName}>
            {content.message}
          </p>
          {r.closing.signature ? (
            <p className={r.closing.signature.className} data-inv-reveal>
              With love, {titleParts(content).title}
            </p>
          ) : null}
        </Section>
      ) : null}

      {Tail ? (
        <Tail view={view} share={share} branding={branding} />
      ) : (
        <>
          {share}
          {branding}
        </>
      )}
    </article>
  );
}

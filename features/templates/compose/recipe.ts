import type { ComponentProps, ComponentType, ReactNode } from "react";
import type { CalendarActions, Countdown, EventDetails, SaveTheDate, Schedule } from "@/features/templates/sections";
import type { InvitationView, MediaItem, ResolvedTheme, TemplateProps } from "@/features/templates/types";

/** Sections that carry a heading (eyebrow, title or side label). */
export type HeadedSection = "details" | "schedule" | "gallery" | "rsvp" | "gifts" | "contacts";

export interface SectionCopy {
  eyebrow?: string;
  title?: string;
  /** Side label, for the "sidebar" frame. */
  label?: string;
  /** Short line under the side label. */
  note?: string;
  /** Sidebar frame only: label in a column beside the content (true) or above it (false). */
  side?: boolean;
}

/**
 * How sections are framed.
 * - "headed": centred (or left) sections with an eyebrow and title above the content.
 * - "sidebar": editorial rows: a small label in a column beside (or above) the content, ruled between.
 */
export type ChapterRecipe =
  | {
      frame: "headed";
      align?: "center" | "left";
      /** Chapter numbers ("01 ——— The details") on the main sections. */
      numbered?: boolean;
      /** Applied to headed sections (details, schedule, gallery, RSVP, gifts, contacts). */
      className?: string;
      introClassName?: string;
      countdownClassName?: string;
      titleClassName?: string;
      eyebrowClassName?: string;
    }
  | { frame: "sidebar"; intro: SectionCopy };

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- any component, to borrow its props
type Pass<T extends React.JSXElementConstructor<any>> = Partial<Omit<ComponentProps<T>, "view">>;

/**
 * A template, described as data plus a few small components (hero, cover
 * frame, ornaments). `ComposedTemplate` turns it into the page, so every
 * template shares one section skeleton: order, ids the dock links to,
 * chapter numbering, motion attributes and accessibility live in one place.
 */
export interface TemplateRecipe {
  /** Extra classes for the <article> (for example `relative overflow-hidden` when there is a backdrop). */
  article?: string;
  /** Absolutely positioned decorations behind the page (florals, blobs). */
  Backdrop?: ComponentType;
  Hero: ComponentType<TemplateProps>;
  /** Frame for the owner's cover photo. */
  Cover: ComponentType<{ media: MediaItem }>;
  /** Shown where the cover would be when there is no cover photo. */
  NoCover?: ComponentType;
  chapter: ChapterRecipe;
  copy: Record<HeadedSection, SectionCopy>;
  intro: {
    /** Where the category lines (families, agenda, hosts) go relative to the welcome text. */
    order?: "hosts-text-lines" | "lines-text";
    /** false when the hero already shows the hosts. */
    hosts: false | { className: string; reveal?: boolean };
    textClassName: string;
    lines: { as: "div" | "ul" | "p"; className: string };
  };
  countdown: {
    saveTheDate?: Pass<typeof SaveTheDate>;
    /** Between the save-the-date card and the countdown: a label, a rule or space. */
    between: ReactNode;
    countdown?: Pass<typeof Countdown>;
  };
  details: {
    /** Box around the details; omit for none. */
    panel?: { className: string; reveal?: boolean };
    event?: Pass<typeof EventDetails>;
    dressCode: { format: (value: string) => string; className: string };
    calendar?: Pass<typeof CalendarActions>;
  };
  schedule?: Pass<typeof Schedule>;
  gallery: { rounded: string };
  rsvp?: { className?: string };
  gifts?: { className?: string };
  contacts?: { className?: string };
  closing: {
    className?: string;
    align?: "center" | "left";
    Ornament?: ComponentType;
    textClassName: string;
    /** "With love, Aisha & Rohan" under the message. */
    signature?: { className: string };
  };
  share: { className: string };
  branding?: { className?: string | ((sections: ResolvedTheme["sections"]) => string | undefined) };
  /** Wraps the closing share block and branding (extra ornaments, a footer line). */
  Tail?: ComponentType<{ view: InvitationView; share: ReactNode; branding: ReactNode }>;
}

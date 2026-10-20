import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { InvitationView, MediaItem } from "@/features/templates/types";
import { formatEventDate } from "@/lib/utils/dates";
import { shareTitle, titleParts } from "@/features/templates/title";

/** Category-specific supporting text each template can place where it fits. */
export function kindDetails(view: InvitationView): { eyebrow: string; lines: string[] } {
  const c = view.content;
  switch (c.kind) {
    case "wedding":
      return { eyebrow: "Wedding celebration", lines: [c.familyOne, c.familyTwo].filter(Boolean) };
    case "engagement":
      return { eyebrow: "Engagement celebration", lines: [] };
    case "birthday":
      return { eyebrow: c.age ? `Turning ${c.age}` : "Birthday celebration", lines: [] };
    case "anniversary":
      return { eyebrow: c.years ? `${c.years} years together` : "Anniversary celebration", lines: [] };
    case "baby-shower":
      return {
        eyebrow: c.reveal === "boy" ? "It's a boy" : c.reveal === "girl" ? "It's a girl" : "Baby shower",
        lines: [c.babyName ? `Welcoming ${c.babyName}` : ""].filter(Boolean),
      };
    case "housewarming":
      return { eyebrow: "Housewarming", lines: [c.hostNames ? `Hosted by ${c.hostNames}` : ""].filter(Boolean) };
    case "party":
      return { eyebrow: c.occasion || "You're invited", lines: [c.hostNames ? `Hosted by ${c.hostNames}` : ""].filter(Boolean) };
    case "corporate":
      return { eyebrow: c.organisation, lines: c.agenda ? c.agenda.split(/\s*·\s*|\n+/).filter(Boolean) : [] };
  }
}

export function monogram(view: InvitationView): string {
  const c = view.content;
  if ("partnerOne" in c && "partnerTwo" in c && c.partnerOne && c.partnerTwo) {
    return `${c.partnerOne[0]}${c.partnerTwo[0]}`.toUpperCase();
  }
  const words = c.headline.split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function CoverImage({ media, className, priority = false, sizes = "(min-width: 768px) 768px, 100vw" }: { media: MediaItem | null; className?: string; priority?: boolean; sizes?: string }) {
  if (!media) return null;
  return (
    <Image
      src={media.url}
      alt={media.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}

/** Thin rule with a central diamond. */
export function RuleOrnament({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-(--inv-accent)", className)} aria-hidden data-inv-reveal="draw">
      <span className="h-px w-16 origin-right bg-current opacity-60" data-line />
      <span className="size-1.5 rotate-45 bg-current" />
      <span className="h-px w-16 origin-left bg-current opacity-60" data-line />
    </div>
  );
}

export function LeafOrnament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={cn("size-40 text-(--inv-accent)", className)} fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden data-inv-reveal="draw">
      <path d="M20 180 C 60 120, 120 80, 180 20" />
      <path d="M60 140 c -20 -30 -10 -60 20 -70 c 10 30 0 60 -20 70z" />
      <path d="M90 110 c -5 -35 15 -60 45 -65 c 0 35 -20 60 -45 65z" />
      <path d="M120 80 c 5 -30 30 -45 55 -45 c -5 30 -25 48 -55 45z" />
      <path d="M45 160 c -25 -10 -35 -35 -30 -60 c 25 10 35 35 30 60z" />
    </svg>
  );
}

export function DecoCorner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={cn("size-14 text-(--inv-accent)", className)} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden data-inv-reveal="draw">
      <path d="M2 78 V 2 H 78" />
      <path d="M12 78 V 12 H 78" opacity="0.6" />
      <path d="M22 78 V 22 H 78" opacity="0.35" />
      <circle cx="2" cy="2" r="2" fill="currentColor" />
    </svg>
  );
}

export function Confetti({ className }: { className?: string }) {
  const pieces = [
    { x: "6%", y: "8%", r: 12, c: "var(--inv-accent)", s: 14 },
    { x: "88%", y: "12%", r: -20, c: "var(--inv-c2)", s: 10 },
    { x: "14%", y: "62%", r: 45, c: "var(--inv-c3)", s: 12 },
    { x: "92%", y: "58%", r: 15, c: "var(--inv-accent)", s: 16 },
    { x: "50%", y: "4%", r: 70, c: "var(--inv-c3)", s: 9 },
    { x: "70%", y: "86%", r: 30, c: "var(--inv-c2)", s: 13 },
    { x: "28%", y: "90%", r: -35, c: "var(--inv-accent)", s: 10 },
    { x: "80%", y: "35%", r: 60, c: "var(--inv-c3)", s: 8 },
  ];
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className={cn("absolute block", i % 3 === 0 ? "rounded-full" : "rounded-[2px]")}
          data-inv-speed={((i % 4) + 1) * 0.12}
          style={{ left: p.x, top: p.y, width: p.s, height: i % 3 === 0 ? p.s : p.s * 0.45, background: p.c, transform: `rotate(${p.r}deg)` }}
        />
      ))}
    </div>
  );
}

/**
 * Hero title block: the optional headline line sits above the main title
 * (partner names for couple events). Templates style both via class names.
 */
export function HeroTitle({ view, className, headlineClassName }: { view: InvitationView; className?: string; headlineClassName?: string }) {
  const { title, headline } = titleParts(view.content);
  return (
    <>
      {headline ? (
        <p className={cn("mt-4 text-base text-pretty sm:text-lg", headlineClassName)} data-testid="hero-headline" data-inv-hero>
          {headline}
        </p>
      ) : null}
      <h1 className={className} data-inv-hero="title">
        {title}
      </h1>
    </>
  );
}

/** The owner's blessing line (any script), shown at the very top of the hero. */
export function Invocation({ view, className }: { view: InvitationView; className?: string }) {
  if (!view.content.invocation) return null;
  return (
    <p className={cn("mb-6 text-sm tracking-wide text-(--inv-accent) sm:text-base", className)} data-inv-hero>
      {view.content.invocation}
    </p>
  );
}

/** Text shared by every template's closing share block. */
export function shareData(view: InvitationView) {
  const title = shareTitle(view.content);
  return { title, text: `You're invited: ${title}\n${formatEventDate(view.content.startsAt, view.content.timezone)}` };
}

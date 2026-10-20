import type { InvitationContent } from "@/lib/validation/content";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * Splits what the hero shows into a primary title and an optional headline.
 * Couple events (wedding, engagement, anniversary) use the partner names as the
 * title and show the headline as its own line, unless it just repeats the names.
 * Other events use the headline as the title.
 */
export function titleParts(content: InvitationContent): { title: string; headline: string } {
  if (content.kind === "wedding" || content.kind === "engagement" || content.kind === "anniversary") {
    const a = content.partnerOne.trim();
    const b = content.partnerTwo.trim();
    const names = a && b ? `${a} & ${b}` : a || b;
    if (names) {
      const h = content.headline.trim();
      const repeats = !h || norm(h) === norm(names) || norm(h) === norm(`${a} and ${b}`);
      return { title: names, headline: repeats ? "" : h };
    }
  }
  return { title: content.headline, headline: "" };
}

/** One-line label for share titles and Open Graph. */
export function shareTitle(content: InvitationContent): string {
  const { title, headline } = titleParts(content);
  return headline ? `${title} · ${headline}` : title;
}

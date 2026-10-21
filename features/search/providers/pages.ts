import "server-only";
import type { SearchProvider } from "@/features/search/provider";
import { scoreFields } from "@/features/search/score";
import type { SearchIconKey } from "@/features/search/types";
import { BRAND } from "@/lib/brand";
import { PRIMARY_NAV, ROUTES, SUPPORT_NAV } from "@/lib/routes";

/** Extra words for each page (the navigation labels are matched too). */
const KEYWORDS: Partial<Record<string, string>> = {
  [ROUTES.home]: "home start dashboard overview",
  [ROUTES.templates]: "designs themes catalogue",
  [ROUTES.invitations]: "my invitations drafts published events",
  [ROUTES.howItWorks]: "guide steps tutorial",
  [ROUTES.pricing]: "plans price cost premium free upgrade",
  [ROUTES.help]: "support faq questions contact",
  [ROUTES.about]: `about ${BRAND.name} company`,
};

/** The product's pages, from the same navigation lists the rail and menus use. */
export const pagesProvider: SearchProvider = {
  group: "pages",
  label: "Pages",
  async search(query, ctx) {
    const pages: { title: string; href: string; icon: SearchIconKey }[] = [
      ...PRIMARY_NAV.filter((n) => n.key !== "create").map((n) => ({ title: n.label, href: n.href, icon: "page" as const })),
      ...SUPPORT_NAV.map((n) => ({ title: n.label, href: n.href, icon: "page" as const })),
      ...(ctx.user && !ctx.user.isGuest ? [{ title: "Settings", href: ROUTES.settings, icon: "settings" as const }] : []),
    ];
    return pages.flatMap((p) => {
      const score = scoreFields(query, [
        { value: p.title, weight: 0.9 },
        { value: KEYWORDS[p.href], weight: 0.6 },
      ]);
      return score ? [{ id: `page:${p.href}`, group: "pages" as const, title: p.title, href: p.href, icon: p.icon, score }] : [];
    });
  },
};

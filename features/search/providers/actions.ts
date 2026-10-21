import "server-only";
import type { SearchProvider } from "@/features/search/provider";
import { scoreFields } from "@/features/search/score";
import { OCCASION_SYNONYMS } from "@/features/search/synonyms";
import type { SearchIconKey } from "@/features/search/types";
import { CATEGORY_LABELS } from "@/lib/categories";
import { ROUTES, routes } from "@/lib/routes";
import { CATEGORY_SLUGS } from "@/types/domain";

interface Action {
  id: string;
  title: string;
  keywords: string;
  href: string;
  icon: SearchIconKey;
}

/** Things to do rather than things to find: create, browse, account. */
export const actionsProvider: SearchProvider = {
  group: "actions",
  label: "Quick actions",
  async search(query, ctx) {
    const account = ctx.user && !ctx.user.isGuest;
    const actions: Action[] = [
      { id: "create", title: "Create an invitation", keywords: "new create make start design invite card", href: ROUTES.newInvitation, icon: "plus" },
      ...CATEGORY_SLUGS.map((slug) => ({
        id: `create:${slug}`,
        title: `Create a ${CATEGORY_LABELS[slug].toLowerCase()} invitation`,
        keywords: `new create make ${CATEGORY_LABELS[slug]} ${OCCASION_SYNONYMS[slug]}`,
        href: routes.newInvitation({ category: slug }),
        icon: `category:${slug}` as const,
      })),
      { id: "browse", title: "Browse templates", keywords: "templates designs themes catalogue browse explore", href: ROUTES.templates, icon: "layout" },
      ...(account
        ? [
            { id: "settings", title: "Account settings", keywords: "settings profile account name email plan", href: ROUTES.settings, icon: "settings" as const },
            { id: "security", title: "Change password", keywords: "password security sign in login email", href: ROUTES.security, icon: "settings" as const },
          ]
        : [
            { id: "login", title: "Log in", keywords: "login log in sign in account", href: ROUTES.login, icon: "login" as const },
            { id: "signup", title: "Create a free account", keywords: "sign up signup register join account free", href: ROUTES.signup, icon: "login" as const },
          ]),
    ];
    return actions.flatMap((a) => {
      const score = scoreFields(query, [
        { value: a.title, weight: 1 },
        { value: a.keywords, weight: 0.75 },
      ]);
      return score ? [{ id: `action:${a.id}`, group: "actions" as const, title: a.title, href: a.href, icon: a.icon, score }] : [];
    });
  },
};

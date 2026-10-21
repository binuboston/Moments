import "server-only";
import { HELP_SECTIONS } from "@/features/help/content";
import type { SearchProvider } from "@/features/search/provider";
import { scoreFields } from "@/features/search/score";
import { ROUTES, routes } from "@/lib/routes";

const POLICIES = [
  { id: "privacy", question: "Privacy summary", answer: "privacy data personal information guest responses delete gdpr", href: ROUTES.privacy, section: "Policies" },
  { id: "terms", question: "Terms summary", answer: "terms of service rules conditions content removal", href: ROUTES.terms, section: "Policies" },
];

/** Help centre answers (the same questions the help page shows) and policy summaries. */
export const helpProvider: SearchProvider = {
  group: "help",
  label: "Help",
  async search(query) {
    const entries = [
      ...HELP_SECTIONS.flatMap((s) => s.items.map((item, i) => ({ id: `${s.id}-${i}`, question: item.question, answer: item.answer, href: routes.helpSection(s.id), section: s.title }))),
      ...POLICIES,
    ];
    return entries.flatMap((e) => {
      const score = scoreFields(query, [
        { value: e.question, weight: 1 },
        { value: e.section, weight: 0.6 },
        { value: e.answer, weight: 0.5 },
      ]);
      return score ? [{ id: `help:${e.id}`, group: "help" as const, title: e.question, subtitle: e.section, href: e.href, icon: "help" as const, score }] : [];
    });
  },
};

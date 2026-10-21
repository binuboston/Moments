import type { Metadata } from "next";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { AppLink } from "@/components/layout/app-link";
import { EmptyState } from "@/components/ui/empty-state";
import { ResultRow } from "@/features/search/components/result-row";
import { MAX_QUERY } from "@/features/search/score";
import { runSearch } from "@/features/search/server";
import { ROUTES } from "@/lib/routes";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams;
  const term = typeof q === "string" ? q.trim().slice(0, MAX_QUERY) : "";
  return { title: term ? `Search: ${term}` : "Search", robots: { index: false } };
}

/**
 * All results for a header search ("See all results", or Enter without
 * choosing a result). Server-rendered from the same providers as the
 * dropdown, with more results per group. Works without an account.
 */
export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const term = typeof q === "string" ? q.trim().slice(0, MAX_QUERY) : "";
  const { groups } = term ? await runSearch(term, { limit: 30 }) : { groups: [] };
  const count = groups.reduce((n, g) => n + g.results.length, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{term ? <>Results for “{term}”</> : "Search"}</h1>
      <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
        {term ? (count ? `${count} ${count === 1 ? "result" : "results"}` : "No results") : "Use the search at the top to find invitations, guests, templates and help."}
      </p>

      {term && count === 0 ? (
        <EmptyState
          className="mt-8"
          icon={SearchIcon}
          title={`Nothing matches “${term}”`}
          description="Try an occasion (wedding, birthday), a template name, a guest's name or a question."
          action={
            <Link href={ROUTES.templates} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Browse all templates
            </Link>
          }
        />
      ) : null}

      <div className="mt-8 grid gap-8">
        {groups.map((g) => (
          <section key={g.group} aria-labelledby={`search-${g.group}`}>
            <h2 id={`search-${g.group}`} className="mb-2 text-sm font-semibold text-muted-foreground">
              {g.label} <span className="font-normal">· {g.total}</span>
            </h2>
            <ul className="surface-card divide-y divide-border overflow-hidden">
              {g.results.map((r) => (
                <li key={r.id}>
                  <AppLink href={r.href} className="block px-4 py-3 transition-colors hover:bg-fill/60 focus-visible:bg-fill focus-visible:outline-none" data-testid={`search-result-${r.id}`}>
                    <ResultRow icon={r.icon} title={r.title} subtitle={r.subtitle} query={term} size="md" />
                  </AppLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { DesignFeed } from "@/features/home/design-feed";
import { NextUp } from "@/features/home/next-up";
import { OccasionChips } from "@/features/home/occasion-chips";
import { InvitationGrid } from "@/features/invitations/components/invitation-grid";
import { getOverviewSummary, listOwnedInvitations } from "@/features/invitations/queries";
import { getActiveCategories, getPublishedTemplates } from "@/features/templates/queries";
import { BRAND } from "@/lib/brand";
import { ROUTES } from "@/lib/routes";
import { createClient, getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: { absolute: BRAND.title }, description: BRAND.description, alternates: { canonical: ROUTES.home } };

/**
 * Home, the index of the product. Everyone sees designs to start from;
 * people with invitations see them first. No session is needed to browse:
 * a guest session starts only when someone creates.
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  const supabase = user ? await createClient() : null;
  const [templates, categories, list, summary, profile] = await Promise.all([
    getPublishedTemplates(),
    getActiveCategories(),
    user && supabase ? listOwnedInvitations(supabase, user.id, { status: "all", page: 1, pageSize: 4 }) : null,
    user && supabase ? getOverviewSummary(supabase, user.id) : null,
    user ? getCurrentProfile() : null,
  ]);
  const hasInvitations = Boolean(list && list.counts.all > 0);
  const firstName = (profile?.full_name || "").split(" ")[0];

  return (
    <div className="grid gap-8 px-4 pt-2 pb-10 sm:px-6">
      <OccasionChips categories={categories} />

      {hasInvitations && list ? (
        <section aria-labelledby="home-title" className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 id="home-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {firstName ? `Welcome back, ${firstName}` : "Your invitations"}
              </h1>
              {summary?.next ? (
                <div className="mt-3">
                  <NextUp next={summary.next} />
                </div>
              ) : null}
            </div>
            <Link href={ROUTES.invitations} className="rounded-full bg-fill px-4 py-2 text-sm font-semibold transition-colors hover:bg-fill-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              See all {list.counts.all}
            </Link>
          </div>
          <InvitationGrid items={list.items} />
        </section>
      ) : (
        <header className="max-w-2xl">
          <h1 id="home-title" className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Invitations, <span className="text-primary">beautifully yours</span>
          </h1>
          <p className="mt-2 text-muted-foreground text-pretty">Pick a design, add your details and share a link guests actually open. Start now, no account needed.</p>
        </header>
      )}

      <section aria-labelledby="designs-title" className="grid gap-4">
        <h2 id="designs-title" className="text-xl font-semibold tracking-tight">
          {hasInvitations ? "Start something new" : "Start from a design"}
        </h2>
        <DesignFeed templates={templates} categories={categories} showCreate={!hasInvitations} />
      </section>
    </div>
  );
}

import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyInvitations } from "@/features/dashboard/empty-invitations";
import { OverviewHero } from "@/features/dashboard/overview-hero";
import { StatTiles } from "@/features/dashboard/stat-tiles";
import { InvitationGrid } from "@/features/invitations/components/invitation-grid";
import { getOverviewSummary, listOwnedInvitations } from "@/features/invitations/queries";
import { createClient, getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [supabase, profile] = await Promise.all([createClient(), getCurrentProfile()]);
  const [list, summary] = await Promise.all([
    listOwnedInvitations(supabase, user.id, { status: "all", q: "", page: 1, pageSize: 6 }),
    getOverviewSummary(supabase, user.id),
  ]);
  const firstName = (profile?.full_name || "").split(" ")[0];

  return (
    <div className="grid grid-cols-1 gap-6 sm:gap-8">
      <OverviewHero firstName={firstName} next={summary.next} />

      <StatTiles
        stats={[
          { key: "invitations", label: "Invitations", value: list.counts.all, href: "/dashboard/invitations" },
          { key: "published", label: "Published", value: list.counts.published, href: "/dashboard/invitations?status=published" },
          { key: "drafts", label: "Drafts", value: list.counts.draft, href: "/dashboard/invitations?status=draft" },
          { key: "upcoming", label: "Upcoming events", value: summary.upcoming, href: "/dashboard/invitations" },
        ]}
      />

      <section aria-labelledby="recent-title">
        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 id="recent-title" className="text-lg font-semibold">
            Recent invitations
          </h2>
          {list.counts.all > 0 ? (
            <Button asChild variant="link" size="sm" className="group">
              <Link href="/dashboard/invitations">
                View all <ArrowRightIcon aria-hidden className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          ) : null}
        </div>
        {list.items.length === 0 ? <EmptyInvitations /> : <InvitationGrid items={list.items} />}
      </section>
    </div>
  );
}

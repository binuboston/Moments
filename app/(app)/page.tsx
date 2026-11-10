import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NextUp } from "@/features/home/next-up";
import { NewInvitationWizard } from "@/features/invitations/components/new-invitation-wizard";
import { createFlowQuery, getWizardProps } from "@/features/invitations/wizard-data";
import { InvitationGrid } from "@/features/invitations/components/invitation-grid";
import { getOverviewSummary, listOwnedInvitations } from "@/features/invitations/queries";
import { BRAND } from "@/lib/brand";
import { CATEGORY_LABELS } from "@/lib/categories";
import { createFlowPath, ROUTES, routes } from "@/lib/routes";
import { createClient, getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

const occasionOf = (value: string | string[] | undefined) => {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v in CATEGORY_LABELS ? (v as keyof typeof CATEGORY_LABELS) : undefined;
};

export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const category = occasionOf((await searchParams).category);
  if (!category) return { title: { absolute: BRAND.title }, description: BRAND.description, alternates: { canonical: ROUTES.home } };
  const name = CATEGORY_LABELS[category];
  return {
    title: `${name} invitation designs`,
    description: `Digital ${name.toLowerCase()} invitation designs with live previews. Every design adapts to your names, dates, photos and colours.`,
    alternates: { canonical: routes.browse({ category }) },
  };
}

/**
 * Home, the index of the product.
 *
 * - Signed in: your space. Welcome, what's next, your latest invitations and
 *   one clear way to start a new one. Creating itself is the Create tab.
 * - Signed out: there is nothing personal yet, so Home is the Create flow
 *   (wedding designs first, an occasion select, Preview, then Continue). The old
 *   /templates and occasion links (`?category=`) land here.
 */
export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const account = user && !user.is_anonymous ? user : null;

  if (!account) {
    const wizard = await getWizardProps(params);
    return (
      <div className="grid gap-8 px-4 pt-2 pb-10 sm:px-6">
        {/* No visible title: the designs are the screen. The heading stays for screen readers. */}
        <h1 className="sr-only">Invitations, beautifully yours: pick a design to start</h1>
        <NewInvitationWizard {...wizard} />
      </div>
    );
  }

  // A link into the flow (an occasion, a chosen design, or the return from sign-in) continues in the Create tab.
  const flow = createFlowQuery(params);
  if (flow) redirect(createFlowPath("account", flow));

  const supabase = await createClient();
  const [list, summary, profile] = await Promise.all([
    listOwnedInvitations(supabase, account.id, { status: "all", page: 1, pageSize: 4 }),
    getOverviewSummary(supabase, account.id),
    getCurrentProfile(),
  ]);
  const firstName = (profile?.full_name || "").split(" ")[0];
  const total = list.counts.all;

  return (
    <div className="grid gap-6 px-4 pt-2 pb-10 sm:gap-8 sm:px-6">
      <section aria-labelledby="home-title" className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 id="home-title" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
          </h1>
          {summary.next ? (
            <div className="mt-3">
              <NextUp next={summary.next} />
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">{total > 0 ? "Pick up where you left off, or start something new." : "Your invitations will live here."}</p>
          )}
        </div>
        <Link
          href={ROUTES.newInvitation}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          data-testid="home-create"
        >
          <PlusIcon className="size-4" aria-hidden /> Create new invitation
        </Link>
      </section>

      {total > 0 ? (
        <section aria-labelledby="recent-title" className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="recent-title" className="text-lg font-semibold tracking-tight">
              Your invitations
            </h2>
            <Link href={ROUTES.invitations} className="rounded-full bg-fill px-4 py-2 text-sm font-semibold transition-colors hover:bg-fill-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              See all {total}
            </Link>
          </div>
          <InvitationGrid items={list.items} />
        </section>
      ) : (
        <Link
          href={ROUTES.newInvitation}
          className="surface-card surface-hover grid place-items-center gap-3 rounded-3xl border-2 border-dashed border-border p-10 text-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <PlusIcon className="size-6" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight">Create your first invitation</span>
          <span className="max-w-sm text-sm text-muted-foreground text-pretty">Pick the occasion and a design. It takes a minute, and you can change everything later.</span>
        </Link>
      )}
    </div>
  );
}

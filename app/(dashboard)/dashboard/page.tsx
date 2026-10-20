import { ArrowRightIcon, CalendarIcon, MailIcon, PlusIcon, SendIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InvitationCard } from "@/features/invitations/components/invitation-card";
import { listOwnedInvitations } from "@/features/invitations/queries";
import { createClient, getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

function countUpcoming(items: { startsAt: string | null }[]): number {
  const now = Date.now();
  return items.filter((i) => i.startsAt && new Date(i.startsAt).getTime() > now).length;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [supabase, profile] = await Promise.all([createClient(), getCurrentProfile()]);
  const list = await listOwnedInvitations(supabase, user.id, { status: "all", q: "", page: 1, pageSize: 6 });
  const upcoming = countUpcoming(list.items);
  const firstName = (profile?.full_name || "").split(" ")[0];

  const stats = [
    { label: "Invitations", value: list.counts.all, icon: MailIcon },
    { label: "Published", value: list.counts.published, icon: SendIcon },
    { label: "Upcoming events", value: upcoming, icon: CalendarIcon },
  ];

  return (
    <div className="grid gap-8">
      <PageHeader
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description="Create, edit and share your invitations."
        actions={
          <Button asChild>
            <Link href="/dashboard/invitations/new">
              <PlusIcon aria-hidden /> New invitation
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent invitations</h2>
          {list.counts.all > 0 ? (
            <Button asChild variant="link" size="sm">
              <Link href="/dashboard/invitations">
                View all <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          ) : null}
        </div>
        {list.items.length === 0 ? (
          <EmptyState
            icon={MailIcon}
            title="No invitations yet"
            description="Start with a template and have a beautiful invitation ready to share in minutes."
            action={
              <Button asChild>
                <Link href="/dashboard/invitations/new">
                  <PlusIcon aria-hidden /> Create your first invitation
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.items.map((item) => (
              <li key={item.id}>
                <InvitationCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

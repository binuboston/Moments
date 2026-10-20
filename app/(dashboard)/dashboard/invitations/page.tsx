import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { InvitationList } from "@/features/invitations/components/invitation-list";
import { listOwnedInvitations } from "@/features/invitations/queries";
import { invitationListQuerySchema } from "@/lib/validation/invitation";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Invitations", robots: { index: false } };

export default async function InvitationsPage({ searchParams }: PageProps<"/dashboard/invitations">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const sp = await searchParams;
  const params = invitationListQuerySchema.parse({
    status: typeof sp.status === "string" ? sp.status : undefined,
    q: typeof sp.q === "string" ? sp.q : undefined,
    page: typeof sp.page === "string" ? sp.page : undefined,
  });
  const supabase = await createClient();
  const initial = await listOwnedInvitations(supabase, user.id, params);

  return (
    <div className="grid grid-cols-1 gap-5 sm:gap-8">
      <PageHeader
        title="Invitations"
        description="Everything you've created, in one place."
        hideActionsOnMobile
        actions={
          <Button asChild>
            <Link href="/dashboard/invitations/new">
              <PlusIcon aria-hidden /> New invitation
            </Link>
          </Button>
        }
      />
      <InvitationList initialParams={params} initialData={initial} />
    </div>
  );
}

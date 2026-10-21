import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { InvitationList } from "@/features/invitations/components/invitation-list";
import { listOwnedInvitations } from "@/features/invitations/queries";
import { invitationListQuerySchema } from "@/lib/validation/invitation";
import { requireAppUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Invitations", robots: { index: false } };

export default async function InvitationsPage({ searchParams }: PageProps<"/invitations">) {
  const user = await requireAppUser(ROUTES.invitations);
  const sp = await searchParams;
  const params = invitationListQuerySchema.parse({
    status: typeof sp.status === "string" ? sp.status : undefined,
    page: typeof sp.page === "string" ? sp.page : undefined,
  });
  const supabase = await createClient();
  const initial = await listOwnedInvitations(supabase, user.id, params);

  return (
    <div className="grid grid-cols-1 gap-5 sm:gap-8">
      <PageHeader
        title="Invitations"
        description="Everything you've created, in one place."
      />
      <InvitationList initialParams={params} initialData={initial} />
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewInvitationWizard } from "@/features/invitations/components/new-invitation-wizard";
import { createFlowQuery, getWizardProps } from "@/features/invitations/wizard-data";
import { getAccount } from "@/lib/auth/session";
import { createFlowPath } from "@/lib/routes";

export const metadata: Metadata = { title: "New invitation", robots: { index: false } };

/**
 * The Create flow for account holders (the Create tab). Visitors build on Home
 * instead, which is their front door; links here (demo "Use this design",
 * old /invitations/new links) send them there with the choice kept.
 */
export default async function NewInvitationPage({ searchParams }: PageProps<"/create">) {
  const params = await searchParams;
  if (!(await getAccount())) redirect(createFlowPath("visitor", createFlowQuery(params)));
  const wizard = await getWizardProps(params);
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-8">
      {/* No visible title: the Create tab says where you are and the designs are the screen. */}
      <h1 className="sr-only">Create an invitation</h1>
      <NewInvitationWizard {...wizard} />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { InvitationEditor } from "@/features/invitations/editor/invitation-editor";
import { getOwnedInvitationDraft } from "@/features/invitations/queries";
import { getPublishedTemplates } from "@/features/templates/queries";
import { uuid } from "@/lib/validation/common";
import { createClient, getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Edit invitation", robots: { index: false } };

export default async function EditInvitationPage({ params }: PageProps<"/dashboard/invitations/[id]/edit">) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [supabase, profile, templates] = await Promise.all([createClient(), getCurrentProfile(), getPublishedTemplates()]);
  const draft = await getOwnedInvitationDraft(supabase, id, user.id, profile?.plan ?? "free");
  if (!draft) notFound();

  const options = templates
    .filter((t) => t.def.categories.includes(draft.categorySlug))
    .map((t) => ({ slug: t.row.slug, key: t.def.key, name: t.def.name, description: t.row.description ?? t.def.description, tier: t.row.tier, gradient: t.def.previewGradient }));

  return <InvitationEditor initialDraft={draft} templates={options} />;
}

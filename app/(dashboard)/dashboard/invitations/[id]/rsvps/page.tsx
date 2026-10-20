import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { RsvpManager } from "@/features/rsvp/rsvp-manager";
import { uuid } from "@/lib/validation/common";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "RSVPs", robots: { index: false } };

export default async function RsvpsPage({ params }: PageProps<"/dashboard/invitations/[id]/rsvps">) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) notFound();
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  const { data: inv } = await supabase.from("invitations").select("id, title, status, settings, content").eq("id", id).eq("owner_id", user.id).maybeSingle();
  if (!inv) notFound();
  const headline = (inv.content as { headline?: string } | null)?.headline;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={`/dashboard/invitations/${id}/edit`}>
            <ArrowLeftIcon aria-hidden /> Back to editor
          </Link>
        </Button>
        <PageHeader title="RSVPs" description={inv.title || headline || "Guest responses for this invitation."} />
      </div>
      <RsvpManager invitationId={id} />
    </div>
  );
}

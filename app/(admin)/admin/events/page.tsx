import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { EventsAdmin } from "@/features/admin/events-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Events · Admin", robots: { index: false } };

export default async function AdminEventsPage({ searchParams }: PageProps<"/admin/events">) {
  const sp = await searchParams;
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : 1) || 1);
  const pageSize = 25;
  const status = typeof sp.status === "string" && ["draft", "published", "unpublished"].includes(sp.status) ? (sp.status as "draft" | "published" | "unpublished") : undefined;
  const supabase = await createClient();
  let query = supabase
    .from("invitations")
    .select("id, slug, title, status, published_at, updated_at, owner_id, profiles!inner(full_name), templates!inner(name), event_categories!inner(name)", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (status) query = query.eq("status", status);
  const { data, count } = await query;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-8">
      <PageHeader title="Events" description="All invitations across the platform. Unpublish or remove content that breaks the terms." />
      <EventsAdmin
        rows={(data ?? []).map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          status: r.status,
          publishedAt: r.published_at,
          updatedAt: r.updated_at,
          ownerName: r.profiles.full_name,
          ownerId: r.owner_id,
          templateName: r.templates.name,
          categoryName: r.event_categories.name,
        }))}
        total={count ?? 0}
        page={page}
        pageSize={pageSize}
        status={status}
      />
    </div>
  );
}

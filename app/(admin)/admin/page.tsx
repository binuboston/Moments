import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const count = async (table: "profiles" | "invitations" | "templates" | "event_categories" | "rsvps", filter?: { column: string; value: string }) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (filter) q = q.eq(filter.column, filter.value);
    const { count: c } = await q;
    return c ?? 0;
  };
  const [users, invitations, published, drafts, templates, categories, rsvps] = await Promise.all([
    count("profiles"),
    count("invitations"),
    count("invitations", { column: "status", value: "published" }),
    count("invitations", { column: "status", value: "draft" }),
    count("templates"),
    count("event_categories"),
    count("rsvps"),
  ]);

  const stats = [
    { label: "Users", value: users },
    { label: "Invitations", value: invitations },
    { label: "Published", value: published },
    { label: "Drafts", value: drafts },
    { label: "Templates", value: templates },
    { label: "Categories", value: categories },
    { label: "RSVP responses", value: rsvps },
  ];

  return (
    <div className="grid gap-8">
      <PageHeader title="Platform overview" description="Live counts across all tenants." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-3xl font-semibold tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { TemplatesAdmin } from "@/features/admin/templates-admin";
import { getTemplate } from "@/features/templates/registry";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Templates · Admin", robots: { index: false } };

export default async function AdminTemplatesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("templates").select("*").order("sort_order");
  const rows = (data ?? []).map((row) => ({ ...row, hasRenderer: Boolean(getTemplate(row.renderer_key)) }));
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-8">
      <PageHeader title="Templates" description="Control availability, pricing tier and ordering. Rendering code lives in the repository." />
      <TemplatesAdmin rows={rows} />
    </div>
  );
}

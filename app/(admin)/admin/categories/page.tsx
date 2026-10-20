import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { CategoriesAdmin } from "@/features/admin/categories-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Categories · Admin", robots: { index: false } };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("event_categories").select("*").order("sort_order");
  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-8">
      <PageHeader title="Event categories" description="Names, descriptions, icons and ordering shown in the wizard and catalogue. New categories must match a content schema in the codebase." />
      <CategoriesAdmin rows={data ?? []} />
    </div>
  );
}

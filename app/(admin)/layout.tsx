import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminNav } from "@/features/admin/admin-nav";
import { Logo } from "@/components/layout/logo";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";
import { ROUTES, routes } from "@/lib/routes";

/**
 * Admin gate. The role is checked server-side here and again in every admin
 * API route; RLS policies enforce it a third time in the database.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect(routes.login(ROUTES.admin));
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") notFound();

  return (
    <div className="app-canvas flex min-h-dvh flex-col">
      <header className="surface-float sticky top-0 z-30">
        {/* Phones: brand row, then a scrolling nav row. Desktop: one row. */}
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-4 px-4 sm:px-6 md:h-16 md:flex-nowrap">
          <div className="flex h-14 items-center gap-3 md:h-auto">
            <Logo href={ROUTES.admin} />
            <Badge variant="dark">Admin</Badge>
          </div>
          <Link href={ROUTES.app} className="inline-flex h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground md:order-last">
            <ArrowLeftIcon className="size-4" aria-hidden /> Dashboard
          </Link>
          <div className="-mx-4 w-[calc(100%+2rem)] border-t border-border px-2 py-1.5 md:mx-0 md:w-auto md:border-0 md:p-0">
            <AdminNav />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}

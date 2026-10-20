import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  const profile = await getCurrentProfile();

  return (
    <DashboardShell
      user={{
        email: user.email ?? "",
        name: profile?.full_name || user.user_metadata?.full_name || "",
        role: profile?.role ?? "user",
        plan: profile?.plan ?? "free",
        isGuest: Boolean(user.is_anonymous),
      }}
    >
      {children}
    </DashboardShell>
  );
}

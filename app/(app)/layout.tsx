import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getAccount, requireAppUser } from "@/lib/auth/session";

/** The app. Everyone gets in: signed-out visitors start a guest session first. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAppUser();
  const account = (await getAccount())!;
  return <DashboardShell account={account}>{children}</DashboardShell>;
}

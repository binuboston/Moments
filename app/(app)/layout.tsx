import { CelebrationProvider } from "@/components/brand/celebrate";
import { AppShell } from "@/components/layout/app-shell";
import { AccountProvider } from "@/features/auth/account-context";
import { getAccount } from "@/lib/auth/session";

/**
 * The app: home (the index, open to everyone) plus pages that need a session
 * (invitations, settings: guarded by the proxy and requireAppUser). The server
 * already knows the account, so it seeds the shell (no flash).
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const account = await getAccount();
  return (
    <AccountProvider account={account}>
      <CelebrationProvider>
        <AppShell>{children}</AppShell>
      </CelebrationProvider>
    </AccountProvider>
  );
}

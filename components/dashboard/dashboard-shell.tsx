import { CelebrationProvider } from "@/components/brand/celebrate";
import { AppHeader } from "@/components/layout/app-header";
import { AccountProvider } from "@/features/auth/account-context";
import type { Account } from "@/lib/auth/account";

/**
 * The app shell: the shared site header over the canvas. Guests (anonymous
 * sessions) use the whole app; they are asked to sign in only when they publish.
 */
export function DashboardShell({ account, children }: { account: Account; children: React.ReactNode }) {
  return (
    // The server already knows the account: seed it so app chrome renders the right state at once.
    <AccountProvider account={account}>
    <CelebrationProvider>
      <div className="app-canvas flex min-h-dvh flex-col">
        <AppHeader variant="app" />
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-6xl min-w-0">{children}</div>
        </main>
      </div>
    </CelebrationProvider>
    </AccountProvider>
  );
}

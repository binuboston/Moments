import { CelebrationProvider } from "@/components/brand/celebrate";
import { AppHeader } from "@/components/layout/app-header";
import type { Account } from "@/lib/auth/account";

/**
 * The app shell: the shared site header over the canvas. Guests (anonymous
 * sessions) use the whole app; they are asked to sign in only when they publish.
 */
export function DashboardShell({ account, children }: { account: Account; children: React.ReactNode }) {
  return (
    <CelebrationProvider>
      <div className="app-canvas flex min-h-dvh flex-col">
        <AppHeader account={account} variant="app" />
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-6xl min-w-0">{children}</div>
        </main>
      </div>
    </CelebrationProvider>
  );
}

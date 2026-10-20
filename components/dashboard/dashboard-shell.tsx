import { CelebrationProvider } from "@/components/brand/celebrate";
import { Logo } from "@/components/layout/logo";
import { BottomNav, BottomNavSpacer } from "@/components/dashboard/bottom-nav";
import { HeaderNav } from "@/components/dashboard/header-nav";
import { TopBarAction } from "@/components/dashboard/top-bar-context";
import { GuestBanner } from "@/components/dashboard/guest-banner";
import { UserMenu } from "@/components/dashboard/user-menu";

export interface ShellUser {
  email: string;
  name: string;
  role: "user" | "admin";
  plan: "free" | "pro";
  /** Designing without an account (anonymous session). */
  isGuest: boolean;
}

/**
 * Minimal app shell: one floating header (logo, navigation, primary action,
 * account) over the canvas. Phones get a compact header plus a bottom tab bar.
 */
export function DashboardShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  return (
    <CelebrationProvider>
      <div className="app-canvas flex min-h-dvh flex-col">
        {/* A backing painted with the same fixed canvas hides content scrolling past the floating bar, invisibly. */}
        <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4">
          <div aria-hidden className="app-canvas absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]" />
          <div className="surface-float mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 rounded-2xl px-3 sm:h-16 sm:px-5 md:grid-cols-[1fr_auto_1fr]">
            <Logo href="/dashboard" />
            <HeaderNav className="hidden md:block" />
            <div className="flex items-center justify-end gap-3">
              <TopBarAction />
              <UserMenu user={user} />
            </div>
          </div>
        </header>
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {user.isGuest ? <GuestBanner /> : null}
          <div className="mx-auto w-full max-w-6xl min-w-0">{children}</div>
          <BottomNavSpacer />
        </main>
        <BottomNav />
      </div>
    </CelebrationProvider>
  );
}

import { Logo } from "@/components/layout/logo";
import { BottomNav, BottomNavSpacer } from "@/components/dashboard/bottom-nav";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { UserMenu } from "@/components/dashboard/user-menu";
import { Badge } from "@/components/ui/badge";

export interface ShellUser {
  email: string;
  name: string;
  role: "user" | "admin";
  plan: "free" | "pro";
}

/**
 * Mobile-first app shell. Phones get a compact top bar plus a bottom tab bar;
 * from lg up a persistent sidebar replaces the tab bar.
 */
export function DashboardShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center px-6">
          <Logo href="/dashboard" />
        </div>
        <DashboardNav role={user.role} className="flex-1 px-3" />
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between rounded-xl bg-subtle px-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name || user.email}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant={user.plan === "pro" ? "accent" : "outline"} className="capitalize">
              {user.plan}
            </Badge>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:h-16 sm:px-6 lg:justify-end">
          <Logo href="/dashboard" className="lg:hidden" />
          <UserMenu user={user} />
        </header>
        <main id="main" className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-6xl min-w-0">{children}</div>
          <BottomNavSpacer />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

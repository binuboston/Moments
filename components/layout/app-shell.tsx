import { BottomTabs, BottomTabsSpacer } from "@/components/layout/bottom-tabs";
import { SideRail } from "@/components/layout/side-rail";
import { TopBar } from "@/components/layout/top-bar";

/**
 * The one shell for the whole product (home, app pages and the marketing
 * pages alike): an icon rail on desktop, the search bar on top, a tab bar on
 * phones. Pages render inside `main`.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <SideRail className="hidden md:flex" />
      <div className="flex min-h-dvh min-w-0 flex-col md:pl-[4.5rem]">
        <TopBar />
        <main id="main" className="min-w-0 flex-1">
          {children}
          <BottomTabsSpacer />
        </main>
      </div>
      <BottomTabs className="md:hidden" />
    </div>
  );
}

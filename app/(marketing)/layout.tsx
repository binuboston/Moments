import { AppShell } from "@/components/layout/app-shell";
import { RevealController } from "@/components/motion/reveal-controller";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

/**
 * Templates, About and the support pages share the app shell. The account is
 * resolved in the browser, so these pages stay static.
 */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <SmoothScroll>
      <AppShell>
        <RevealController className="flex flex-1 flex-col">{children}</RevealController>
      </AppShell>
    </SmoothScroll>
  );
}

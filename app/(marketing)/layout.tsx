import { AppHeader } from "@/components/layout/app-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RevealController } from "@/components/motion/reveal-controller";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

/**
 * Marketing pages share the app's header. The account is resolved in the
 * browser, so these pages stay static (no per-request cookie reads).
 */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <SmoothScroll>
      <AppHeader />
      <RevealController className="flex flex-1 flex-col">
        <main id="main" className="flex-1">
          {children}
        </main>
      </RevealController>
      <SiteFooter />
    </SmoothScroll>
  );
}

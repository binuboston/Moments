import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealController } from "@/components/motion/reveal-controller";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <SmoothScroll>
      <SiteHeader />
      <RevealController className="flex flex-1 flex-col">
        <main id="main" className="flex-1">
          {children}
        </main>
      </RevealController>
      <SiteFooter />
    </SmoothScroll>
  );
}

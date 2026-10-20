import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to site
          </Link>
        </div>
        <main className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
      <aside className="relative hidden items-center justify-center overflow-hidden bg-foreground p-12 lg:flex" aria-hidden>
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 30% 20%, #8b2e3f 0, transparent 45%), radial-gradient(circle at 80% 90%, #d4b483 0, transparent 40%)" }} />
        <div className="relative w-full max-w-[20rem]">
          <DeviceFrame scrollable={false} className="border-background/20">
            <InvitationRenderer view={sampleView("wedding", { key: "botanical-noir", name: "Botanical Noir", tier: "premium" })} mode="preview" />
          </DeviceFrame>
        </div>
        <blockquote className="absolute bottom-12 left-12 max-w-sm text-background/80">
          <p className="font-display text-2xl leading-snug">“It took ten minutes and everyone said it was the most beautiful invitation they'd received.”</p>
          <footer className="mt-3 text-sm text-background/60">Aisha, married in Kew</footer>
        </blockquote>
      </aside>
    </div>
  );
}

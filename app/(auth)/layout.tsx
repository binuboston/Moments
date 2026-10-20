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
      <aside className="relative hidden items-center justify-center overflow-hidden bg-stage p-12 text-stage-foreground lg:flex" aria-hidden>
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 25% 15%, #8b2e3f 0, transparent 45%), radial-gradient(circle at 85% 90%, #d4b483 0, transparent 40%)" }} />
        {/* Column layout: the preview and the quote can never overlap. */}
        <div className="relative flex w-full max-w-sm flex-col items-center gap-10">
          <div className="w-full max-w-[17rem]">
            <DeviceFrame scrollable={false} className="border-stage-foreground/15">
              <InvitationRenderer view={sampleView("wedding", { key: "botanical-noir", name: "Botanical Noir", tier: "free" })} mode="preview" />
            </DeviceFrame>
          </div>
          <blockquote className="text-center">
            <p className="text-xl leading-snug font-medium tracking-tight text-balance">“It took ten minutes and everyone said it was the most beautiful invitation they'd received.”</p>
            <footer className="mt-3 text-sm text-stage-muted">Aisha, married in Kew</footer>
          </blockquote>
        </div>
      </aside>
    </div>
  );
}

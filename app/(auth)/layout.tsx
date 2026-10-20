import Link from "next/link";
import { Blossom, CornerBloom } from "@/components/brand/blossom";
import { Logo } from "@/components/layout/logo";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";

const SHOWCASE_BLOOM = { flower: "var(--color-brand-400)", soft: "var(--color-brand-200)", leaf: "color-mix(in oklab, var(--accent) 40%, #4e6b3c)" };

/**
 * Auth pages: the form floats as a card on the app canvas; on large screens an
 * inset "stage" panel shows a live invitation, in the same language as the product.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="app-canvas grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col px-4 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-fill hover:text-foreground">
            Back to site
          </Link>
        </div>
        <main className="flex flex-1 items-center justify-center py-8 sm:py-12">
          <div className="surface-card w-full max-w-md p-6 motion-safe:animate-[pop-in_0.5s_var(--ease-out-quart)_both] sm:p-9">{children}</div>
        </main>
      </div>

      <aside className="relative m-3 hidden items-center justify-center overflow-hidden rounded-[2rem] bg-stage p-12 text-stage-foreground lg:flex" aria-hidden>
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(55% 60% at 20% 10%, color-mix(in oklab, var(--primary) 55%, transparent), transparent 70%), radial-gradient(45% 55% at 90% 95%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 70%)" }}
        />
        <span className="absolute -top-5 -right-5 -scale-x-100">
          <CornerBloom colors={SHOWCASE_BLOOM} className="size-56 opacity-90" />
        </span>
        <span className="absolute -bottom-5 -left-5 -scale-y-100">
          <CornerBloom colors={SHOWCASE_BLOOM} className="size-44 opacity-70" />
        </span>
        {[
          { x: "14%", y: "26%", c: "var(--color-brand-300)", d: "0s" },
          { x: "84%", y: "40%", c: "var(--accent)", d: "1.4s" },
          { x: "22%", y: "78%", c: "var(--accent)", d: "2.2s" },
          { x: "76%", y: "84%", c: "var(--color-brand-200)", d: "0.7s" },
        ].map((b, i) => (
          <span key={i} className="animate-blossom-drift absolute size-5 opacity-60" style={{ left: b.x, top: b.y, color: b.c, animationDelay: b.d }}>
            <Blossom className="size-full" centre="rgb(255 255 255 / 0.5)" />
          </span>
        ))}
        <div className="relative flex w-full max-w-sm flex-col items-center gap-10">
          <div className="w-full max-w-[17rem] rotate-[-2deg] transition-transform duration-700 hover:rotate-0">
            <DeviceFrame scrollable={false} className="border-stage-foreground/15">
              <InvitationRenderer view={sampleView("wedding", { key: "botanical-noir", name: "Botanical Noir", tier: "free" })} mode="preview" />
            </DeviceFrame>
          </div>
          <blockquote className="text-center">
            <p className="text-xl leading-snug font-medium tracking-tight text-balance">
              “It took ten minutes and everyone said it was the most <span className="font-serif font-normal text-brand-200 italic">beautiful</span> invitation they&apos;d received.”
            </p>
            <footer className="mt-3 text-sm text-stage-muted">Aisha, married in Kew</footer>
          </blockquote>
        </div>
      </aside>
    </div>
  );
}

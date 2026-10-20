import { HeartIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { Blossom, CornerBloom } from "@/components/brand/blossom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

/** First-run empty state in the brand language: a miniature opening card with drifting blossoms. */
export function EmptyInvitations() {
  return (
    <div className="surface-card relative flex flex-col items-center overflow-hidden px-6 py-14 text-center">
      {[
        { x: "12%", y: "20%", c: "var(--color-brand-300)", d: "0s" },
        { x: "84%", y: "26%", c: "var(--accent)", d: "1.2s" },
        { x: "22%", y: "78%", c: "var(--accent)", d: "2.1s" },
        { x: "78%", y: "72%", c: "var(--color-brand-200)", d: "0.6s" },
      ].map((b, i) => (
        <span key={i} aria-hidden className="animate-blossom-drift absolute size-4 opacity-70" style={{ left: b.x, top: b.y, color: b.c, animationDelay: b.d }}>
          <Blossom className="size-full" />
        </span>
      ))}
      <div aria-hidden className="relative mb-6 w-36 rounded-2xl bg-[color-mix(in_oklab,var(--accent)_12%,var(--surface))] px-4 pt-5 pb-6 shadow-card-hover">
        <span className="absolute -top-2.5 -left-2.5">
          <CornerBloom className="size-14" />
        </span>
        <span className="mx-auto flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <HeartIcon className="size-4 fill-current" />
        </span>
        <span className="mt-3 block font-serif text-lg leading-tight text-primary italic">You &amp; yours</span>
        <span className="mx-auto mt-2 block h-px w-10 bg-primary/30" />
        <span className="mx-auto mt-3 block h-5 w-16 rounded-full bg-primary/90" />
      </div>
      <h3 className="text-lg font-semibold">No invitations yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">Start with a template and have a beautiful invitation ready to share in minutes.</p>
      <Button asChild className="mt-6">
        <Link href={ROUTES.newInvitation}>
          <PlusIcon aria-hidden /> Create your first invitation
        </Link>
      </Button>
    </div>
  );
}

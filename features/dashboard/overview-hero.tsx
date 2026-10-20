"use client";

import { ArrowUpRightIcon, PencilIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Blossom, CornerBloom } from "@/components/brand/blossom";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { gsap, MQ, useGSAP } from "@/lib/motion/gsap";
import { formatEventDate } from "@/lib/utils/dates";
import type { OverviewSummary } from "@/features/invitations/queries";

/** Drifting blossoms: position (%), size (rem), parallax depth and colour. */
/** Kept to the edges so they never sit behind text. */
const FLOATERS = [
  { x: 3, y: 6, s: 1.1, d: 18, c: "var(--color-brand-300)" },
  { x: 46, y: 3, s: 0.7, d: 10, c: "var(--accent)" },
  { x: 60, y: 92, s: 0.9, d: 24, c: "var(--color-brand-200)" },
  { x: 95, y: 70, s: 1.1, d: 14, c: "var(--accent)" },
  { x: 2, y: 94, s: 0.8, d: 20, c: "var(--color-brand-400)" },
  { x: 30, y: 95, s: 0.6, d: 28, c: "var(--color-brand-200)" },
];

const HERO_BLOOM = { flower: "var(--color-brand-400)", soft: "var(--color-brand-200)", leaf: "color-mix(in oklab, var(--accent) 40%, #4e6b3c)" };

/**
 * Overview welcome: the brand "stage" with drifting blossoms, a corner bloom
 * and a live countdown to the owner's next celebration. Blossoms follow the
 * pointer with depth on desktop; everything is still under reduced motion.
 */
export function OverviewHero({ firstName, next }: { firstName: string; next: OverviewSummary["next"] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(q("[data-bloom]"), { scale: 0, opacity: 0, transformOrigin: "0% 0%" }, { scale: 1, opacity: 1, duration: 1.4, ease: "back.out(1.4)", delay: 0.15 });
        q("[data-float]").forEach((f) =>
          gsap.to(f, { y: gsap.utils.random(-16, -6), rotate: gsap.utils.random(-45, 45), duration: gsap.utils.random(3, 5), ease: "sine.inOut", repeat: -1, yoyo: true }),
        );
        if (!window.matchMedia("(pointer: fine)").matches) return;
        const layers = q("[data-depth]").map((d) => ({
          depth: Number((d as HTMLElement).dataset.depth) || 10,
          x: gsap.quickTo(d, "x", { duration: 0.9, ease: "power3" }),
          y: gsap.quickTo(d, "y", { duration: 0.9, ease: "power3" }),
        }));
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - r.left) / r.width - 0.5;
          const dy = (e.clientY - r.top) / r.height - 0.5;
          layers.forEach((l) => {
            l.x(dx * l.depth);
            l.y(dy * l.depth);
          });
        };
        const onLeave = () => layers.forEach((l) => (l.x(0), l.y(0)));
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="overview-title" className="relative isolate overflow-hidden rounded-3xl bg-stage px-6 py-8 text-stage-foreground sm:px-10 sm:py-12">
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 90% at 88% 0%, color-mix(in oklab, var(--primary) 60%, transparent), transparent 70%), radial-gradient(45% 70% at 0% 100%, color-mix(in oklab, var(--accent) 24%, transparent), transparent 70%)",
        }}
      />
      <span aria-hidden className="pointer-events-none absolute -top-5 -right-5 -z-10 -scale-x-100">
        <CornerBloom data-bloom colors={HERO_BLOOM} className="size-40 opacity-90 sm:size-56" />
      </span>
      {FLOATERS.map((f, i) => (
        <span key={i} aria-hidden data-depth={f.d} className="pointer-events-none absolute -z-10" style={{ left: `${f.x}%`, top: `${f.y}%` }}>
          <span data-float className="block" style={{ width: `${f.s}rem`, height: `${f.s}rem`, color: f.c, opacity: 0.55 }}>
            <Blossom className="size-full" centre="rgb(255 255 255 / 0.5)" />
          </span>
        </span>
      ))}

      <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-end">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-accent uppercase">Your celebrations</p>
          <h1 id="overview-title" className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Welcome back
            {firstName ? (
              <>
                , <span className="font-serif font-normal text-brand-200 italic">{firstName}</span>
              </>
            ) : null}
          </h1>
          <p className="mt-3 max-w-md text-sm text-stage-muted text-pretty sm:text-base">Create, edit and share invitations your guests will remember.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/dashboard/invitations/new">
                <PlusIcon aria-hidden /> New invitation
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-stage-border bg-transparent text-stage-foreground hover:border-stage-muted hover:bg-white/10 hover:text-stage-foreground">
              <Link href="/templates">Browse designs</Link>
            </Button>
          </div>
        </div>
        <NextUp next={next} />
      </div>
    </section>
  );
}

function NextUp({ next }: { next: OverviewSummary["next"] }) {
  const now = useNow();
  if (!next) {
    return (
      <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur-sm">
        <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-stage-muted uppercase">Next up</p>
        <p className="mt-2 font-serif text-2xl italic">Your next celebration starts here.</p>
        <p className="mt-1 text-sm text-stage-muted">Pick an occasion and a design; we&apos;ll set up the rest.</p>
      </div>
    );
  }

  const diff = now === null ? null : Math.max(0, new Date(next.startsAt).getTime() - now);
  const cells = [
    { label: "Days", value: diff === null ? null : Math.floor(diff / 86_400_000) },
    { label: "Hrs", value: diff === null ? null : Math.floor((diff % 86_400_000) / 3_600_000) },
    { label: "Min", value: diff === null ? null : Math.floor((diff % 3_600_000) / 60_000) },
    { label: "Sec", value: diff === null ? null : Math.floor((diff % 60_000) / 1000) },
  ];

  return (
    <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-stage-muted uppercase">Next up</p>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[0.7rem] font-medium capitalize">{next.status}</span>
      </div>
      <p className="mt-2 truncate font-serif text-2xl italic">{next.title}</p>
      <p className="text-sm text-stage-muted">{formatEventDate(next.startsAt, next.timezone)}</p>
      <div className="mt-4 grid grid-cols-4 gap-2" role="timer" aria-label="Time until the event">
        {cells.map((c) => {
          const text = c.value === null ? "--" : String(c.value).padStart(2, "0");
          return (
            <div key={c.label} className="overflow-hidden rounded-xl bg-white/[0.06] py-2 text-center">
              <div className="text-xl font-semibold tabular-nums sm:text-2xl">
                <span key={text} className="inv-tick">
                  {text}
                </span>
              </div>
              <div className="text-[0.6rem] tracking-[0.16em] text-stage-muted uppercase">{c.label}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline" className="border-stage-border bg-transparent text-stage-foreground hover:bg-white/10 hover:text-stage-foreground">
          <Link href={`/dashboard/invitations/${next.id}/edit`}>
            <PencilIcon aria-hidden /> Edit
          </Link>
        </Button>
        {next.status === "published" ? (
          <Button asChild size="sm" variant="ghost" className="text-stage-foreground hover:bg-white/10 hover:text-stage-foreground">
            <a href={next.publicUrl} target="_blank" rel="noopener noreferrer">
              View live <ArrowUpRightIcon aria-hidden />
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

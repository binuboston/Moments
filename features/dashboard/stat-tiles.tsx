"use client";

import { ArrowUpRightIcon, CalendarHeartIcon, FilePenLineIcon, MailIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { IconTile } from "@/components/ui/icon-tile";
import { navigation } from "@/components/motion/page-enter";
import type { Tone } from "@/lib/design/tones";
import { gsap, MQ, useGSAP } from "@/lib/motion/gsap";

const KINDS = {
  invitations: { icon: MailIcon, tone: "blue" },
  published: { icon: SendIcon, tone: "green" },
  drafts: { icon: FilePenLineIcon, tone: "amber" },
  upcoming: { icon: CalendarHeartIcon, tone: "rose" },
} as const satisfies Record<string, { icon: unknown; tone: Tone }>;

export interface Stat {
  key: keyof typeof KINDS;
  label: string;
  value: number;
  href: string;
}

/**
 * Overview figures as floating cards: tone tile, a corner arrow and the whole
 * card links to the matching list. Numbers count up when the page is entered
 * from inside the app (on a hard load they are already painted, so they stay put).
 */
export function StatTiles({ stats }: { stats: Stat[] }) {
  const root = useRef<HTMLUListElement>(null);
  // Count up only when arriving from inside the app (decided at first render, see PageEnter).
  const arrivedInApp = useRef(navigation.hydrated);

  useGSAP(
    () => {
      if (!arrivedInApp.current) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>("[data-count]", root.current).forEach((el, i) => {
          const target = Number(el.dataset.count) || 0;
          const counter = { value: 0 };
          el.textContent = "0";
          gsap.to(counter, {
            value: target,
            duration: 1.1,
            delay: 0.15 + i * 0.06,
            ease: "power3.out",
            onUpdate: () => {
              el.textContent = String(Math.round(counter.value));
            },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <ul ref={root} className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {stats.map((s) => {
        const kind = KINDS[s.key];
        return (
          <li key={s.key} className="group surface-card surface-hover relative p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <IconTile icon={kind.icon} tone={kind.tone} />
              <span aria-hidden className="flex size-8 items-center justify-center rounded-full bg-fill text-foreground transition-[background-color,rotate] duration-(--duration-slow) ease-(--ease-out-quart) group-hover:rotate-45 group-hover:bg-fill-hover">
                <ArrowUpRightIcon className="size-4" />
              </span>
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-tight tabular-nums" data-count={s.value}>
              {s.value}
            </p>
            {/* Stretched link: the whole card is clickable, the label names it. */}
            <Link href={s.href} className="mt-0.5 block text-sm text-muted-foreground outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-ring">
              {s.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { ChevronDownIcon, type LucideIcon } from "lucide-react";
import { IconTile } from "@/components/ui/icon-tile";
import type { Tone } from "@/lib/design/tones";
import { cn } from "@/lib/utils/cn";
import { useEditorStore, type EditorSection as SectionKey } from "@/stores/editor-store";

interface EditorSectionProps {
  id: SectionKey;
  title: string;
  /** One-line summary shown in the header (what is filled in, or what goes here). */
  summary: string;
  icon: LucideIcon;
  tone: Tone;
  children: React.ReactNode;
}

/**
 * A collapsible card in the Edit view. Content stays mounted while collapsed
 * (forms keep their state) but is inert, so it is skipped by keyboard and
 * screen readers. Height animates with a grid-rows transition.
 */
export function EditorSection({ id, title, summary, icon, tone, children }: EditorSectionProps) {
  const open = useEditorStore((s) => s.openSections.includes(id));
  const toggle = useEditorStore((s) => s.toggleSection);
  const panelId = `editor-panel-${id}`;

  return (
    <section id={`editor-${id}`} className="surface-card scroll-mt-36 overflow-hidden">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => toggle(id)}
          data-testid={`editor-section-${id}`}
          className="group flex w-full items-center gap-4 px-4 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-6 sm:py-5"
        >
          <IconTile icon={icon} tone={tone} className="transition-transform duration-(--duration-slow) ease-(--ease-out-quart) group-hover:-rotate-6" />
          <span className="min-w-0 flex-1">
            <span className="block text-base font-semibold tracking-tight">{title}</span>
            <span className="block truncate text-sm text-muted-foreground">{summary}</span>
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fill transition-colors group-hover:bg-fill-hover" aria-hidden>
            <ChevronDownIcon className={cn("size-4 transition-transform duration-(--duration-slow) ease-(--ease-out-quart)", open && "rotate-180")} />
          </span>
        </button>
      </h2>
      <div
        id={panelId}
        className={cn("grid transition-[grid-template-rows] duration-500 ease-(--ease-out-quart) motion-reduce:transition-none", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
      >
        <div className="min-h-0 overflow-hidden" inert={!open}>
          <div className={cn("border-t border-border/60 px-4 pt-5 pb-6 transition-opacity duration-500 sm:px-6", open ? "opacity-100" : "opacity-0")}>{children}</div>
        </div>
      </div>
    </section>
  );
}

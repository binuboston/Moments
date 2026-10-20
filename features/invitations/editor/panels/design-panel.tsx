"use client";

import { CheckIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { fontFamily } from "@/features/templates/fonts";
import { cn } from "@/lib/utils/cn";
import { REQUIRED_SECTIONS, type SectionKey } from "@/types/domain";
import { useEditorStore } from "@/stores/editor-store";

export interface TemplateOption {
  slug: string;
  key: string;
  name: string;
  description: string;
  tier: "free" | "premium";
  gradient: string;
}

const SECTION_LABELS: Record<SectionKey, { label: string; hint: string }> = {
  hero: { label: "Hero", hint: "Always shown" },
  intro: { label: "Introduction", hint: "Hosts, subheading and welcome text" },
  countdown: { label: "Countdown", hint: "Live countdown to the start time" },
  details: { label: "Date & venue", hint: "Always shown" },
  schedule: { label: "Schedule", hint: "Shown when you add functions" },
  gallery: { label: "Gallery", hint: "Shown when you add photos" },
  rsvp: { label: "RSVP", hint: "Shown when RSVP is enabled in settings" },
  contacts: { label: "Contacts", hint: "Shown when you add contacts" },
  gifts: { label: "Gifts", hint: "Shown when you add a gift note or registry" },
  message: { label: "Closing message", hint: "Shown when you add a closing message" },
};

/** Look & feel: palette, typography and which sections show. (Templates are switched from the editor toolbar.) */
export function DesignPanel() {
  const draft = useEditorStore((s) => s.draft)!;
  const setTheme = useEditorStore((s) => s.setTheme);
  const setSectionVisible = useEditorStore((s) => s.setSectionVisible);
  const def = getTemplateOrFallback(draft.templateKey);
  const paletteId = draft.theme.paletteId || def.defaults.paletteId;
  const fontId = draft.theme.fontPairingId || def.defaults.fontPairingId;

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <div>
          <h3 className="text-sm font-semibold">Colour palette</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">Curated for this design so everything stays readable.</p>
        </div>
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {def.palettes.map((p) => {
            const active = p.id === paletteId;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setTheme({ paletteId: p.id })}
                  aria-pressed={active}
                  data-testid={`palette-${p.id}`}
                  className={cn(
                    "group flex w-full flex-col gap-2 rounded-2xl bg-fill p-2 text-left transition-[background-color,box-shadow] duration-(--duration-base) hover:bg-fill-hover focus-visible:ring-2 focus-visible:ring-ring",
                    active && "bg-surface shadow-card ring-2 ring-primary",
                  )}
                >
                  <span className="flex h-9 overflow-hidden rounded-xl transition-transform duration-(--duration-slow) ease-(--ease-out-quart) group-hover:scale-[1.03]">
                    {p.swatch.map((c, i) => (
                      <span key={i} className="flex-1" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="flex items-center justify-between px-1 text-xs font-medium">
                    {p.name}
                    {active ? <CheckIcon className="size-3.5 text-primary" aria-hidden /> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-3">
        <h3 className="text-sm font-semibold">Typography</h3>
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {def.fontPairings.map((f) => {
            const active = f.id === fontId;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setTheme({ fontPairingId: f.id })}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-2xl bg-fill px-4 py-3 text-left transition-[background-color,box-shadow] duration-(--duration-base) hover:bg-fill-hover focus-visible:ring-2 focus-visible:ring-ring",
                    active && "bg-surface shadow-card ring-2 ring-primary",
                  )}
                >
                  <span className="min-w-0">
                    {/* Each option is set in its own display face. */}
                    <span className="block truncate text-lg leading-tight" style={{ fontFamily: fontFamily(f.display) }}>
                      Aa · {f.name.split(" & ")[0]}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{f.name}</span>
                  </span>
                  {active ? <CheckIcon className="size-4 shrink-0 text-primary" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-3">
        <div>
          <h3 className="text-sm font-semibold">Sections</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">Hide optional sections. Sections without content are hidden automatically.</p>
        </div>
        <ul className="grid gap-1.5">
          {def.sections.map((key) => {
            const required = REQUIRED_SECTIONS.includes(key);
            const enabled = draft.theme.sections[key] ?? def.defaultSections.includes(key);
            return (
              <li key={key} className="flex items-center justify-between gap-4 rounded-2xl bg-fill px-4 py-3">
                <div>
                  <Label htmlFor={`section-${key}`} className="text-sm">
                    {SECTION_LABELS[key].label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{SECTION_LABELS[key].hint}</p>
                </div>
                <Switch id={`section-${key}`} checked={required ? true : enabled} disabled={required} onCheckedChange={(v) => setSectionVisible(key, v)} />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

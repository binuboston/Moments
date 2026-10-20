"use client";

import { CheckIcon, LockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { canUseTemplate } from "@/lib/entitlements";
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

export function DesignPanel({ templates }: { templates: TemplateOption[] }) {
  const draft = useEditorStore((s) => s.draft)!;
  const setTheme = useEditorStore((s) => s.setTheme);
  const setTemplate = useEditorStore((s) => s.setTemplate);
  const setSectionVisible = useEditorStore((s) => s.setSectionVisible);
  const def = getTemplateOrFallback(draft.templateKey);
  const paletteId = draft.theme.paletteId || def.defaults.paletteId;
  const fontId = draft.theme.fontPairingId || def.defaults.fontPairingId;

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <div>
          <h2 className="text-base font-semibold">Template</h2>
          <p className="mt-1 text-sm text-muted-foreground">Switch designs any time. Your content stays the same.</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {templates.map((t) => {
            const active = t.key === draft.templateKey;
            const allowed = canUseTemplate(draft.plan, t.tier);
            return (
              <li key={t.slug}>
                <button
                  type="button"
                  onClick={() => setTemplate({ key: t.key, slug: t.slug, tier: t.tier })}
                  aria-pressed={active}
                  className={cn("w-full rounded-2xl border p-2 text-left transition-[border-color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring", active ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40")}
                >
                  <div className="relative h-20 rounded-xl" style={{ background: t.gradient }}>
                    {active ? (
                      <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon className="size-3" />
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2 px-1">
                    <span className="truncate text-sm font-medium">{t.name}</span>
                    {t.tier === "premium" ? (
                      <Badge variant={allowed ? "accent" : "dark"} className="shrink-0">
                        {allowed ? "Pro" : <LockIcon aria-hidden />}
                      </Badge>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        {draft.templateTier === "premium" && !canUseTemplate(draft.plan, "premium") ? (
          <p className="text-xs text-warning">This premium design can be previewed and saved, but publishing needs the Pro plan.</p>
        ) : null}
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="text-base font-semibold">Colour palette</h2>
          <p className="mt-1 text-sm text-muted-foreground">Curated for this template so everything stays readable.</p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {def.palettes.map((p) => {
            const active = p.id === paletteId;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setTheme({ paletteId: p.id })}
                  aria-pressed={active}
                  data-testid={`palette-${p.id}`}
                  className={cn("flex w-full flex-col gap-2 rounded-xl border p-2 text-left focus-visible:ring-2 focus-visible:ring-ring", active ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40")}
                >
                  <span className="flex h-8 overflow-hidden rounded-lg ring-1 ring-black/5">
                    {p.swatch.map((c, i) => (
                      <span key={i} className="flex-1" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="px-0.5 text-xs font-medium">{p.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="text-base font-semibold">Typography</h2>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {def.fontPairings.map((f) => {
            const active = f.id === fontId;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setTheme({ fontPairingId: f.id })}
                  aria-pressed={active}
                  className={cn("flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring", active ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40")}
                >
                  {f.name}
                  {active ? <CheckIcon className="size-4 text-primary" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-3">
        <div>
          <h2 className="text-base font-semibold">Sections</h2>
          <p className="mt-1 text-sm text-muted-foreground">Hide optional sections. Sections without content are hidden automatically.</p>
        </div>
        <ul className="divide-y divide-border rounded-xl border border-border">
          {def.sections.map((key) => {
            const required = REQUIRED_SECTIONS.includes(key);
            const enabled = draft.theme.sections[key] ?? def.defaultSections.includes(key);
            return (
              <li key={key} className="flex items-center justify-between gap-4 px-4 py-3">
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

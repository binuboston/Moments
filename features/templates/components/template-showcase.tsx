"use client";

import { MonitorIcon, SmartphoneIcon } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import { InvitationRenderer } from "@/features/templates/renderer";
import { sampleView } from "@/features/templates/sample-data";
import type { FontPairing, Palette } from "@/features/templates/types";
import type { CategorySlug, TemplateTier } from "@/types/domain";
import { cn } from "@/lib/utils/cn";

interface TemplateShowcaseProps {
  templateKey: string;
  templateName: string;
  tier: TemplateTier;
  categories: CategorySlug[];
  palettes: Palette[];
  fontPairings: FontPairing[];
  defaults: { paletteId: string; fontPairingId: string };
}

const CATEGORY_LABELS: Record<CategorySlug, string> = {
  wedding: "Wedding",
  engagement: "Engagement",
  birthday: "Birthday",
  anniversary: "Anniversary",
  "baby-shower": "Baby shower",
  housewarming: "Housewarming",
  party: "Party",
  corporate: "Corporate",
};

/** Interactive live preview: switch occasion, palette, fonts and device. */
export function TemplateShowcase({ templateKey, templateName, tier, categories, palettes, fontPairings, defaults }: TemplateShowcaseProps) {
  const [category, setCategory] = useState<CategorySlug>(categories[0]);
  const [paletteId, setPaletteId] = useState(defaults.paletteId);
  const [fontPairingId, setFontPairingId] = useState(defaults.fontPairingId);
  const [device, setDevice] = useState<"phone" | "desktop">("phone");

  const base = sampleView(category, { key: templateKey, name: templateName, tier });
  const view = { ...base, theme: { ...base.theme, paletteId, fontPairingId } };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Preview occasion">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                category === c ? "border-foreground bg-foreground text-background" : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <Tabs value={device} onValueChange={(v) => setDevice(v as "phone" | "desktop")} className="ml-auto">
          <TabsList aria-label="Preview device">
            <TabsTrigger value="phone">
              <SmartphoneIcon aria-hidden /> Phone
            </TabsTrigger>
            <TabsTrigger value="desktop">
              <MonitorIcon aria-hidden /> Desktop
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2" role="group" aria-label="Palette">
          {palettes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPaletteId(p.id)}
              aria-pressed={paletteId === p.id}
              aria-label={`${p.name} palette`}
              title={p.name}
              className={cn("flex size-8 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-background transition", paletteId === p.id ? "ring-foreground" : "ring-transparent hover:ring-border")}
            >
              {p.swatch.map((c, i) => (
                <span key={i} className="h-full flex-1" style={{ background: c }} />
              ))}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Typography">
          {fontPairings.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFontPairingId(f.id)}
              aria-pressed={fontPairingId === f.id}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                fontPairingId === f.id ? "border-foreground bg-foreground text-background" : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {device === "phone" ? (
        <div className="mx-auto w-full max-w-[22rem]">
          <DeviceFrame label={`${templateName} phone preview`}>
            <InvitationRenderer view={view} mode="preview" />
          </DeviceFrame>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
          <div className="flex items-center gap-1.5 border-b border-border bg-subtle px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="ml-3 h-5 flex-1 rounded-md bg-surface text-[10px] leading-5 text-muted-foreground">
              <span className="px-3">mirth.app/e/your-event</span>
            </span>
          </div>
          <div className="max-h-[70vh] overflow-y-auto" aria-hidden inert>
            <InvitationRenderer view={view} mode="preview" />
          </div>
        </div>
      )}
    </div>
  );
}

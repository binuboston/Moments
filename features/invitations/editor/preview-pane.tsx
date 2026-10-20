"use client";

import { MonitorIcon, RotateCcwIcon, SmartphoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { DeviceFrame } from "@/features/templates/components/device-frame";
import { InvitationRenderer } from "@/features/templates/renderer";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { draftToView } from "@/features/invitations/mappers";
import { showsBranding } from "@/lib/entitlements";
import { cn } from "@/lib/utils/cn";
import { useEditorStore } from "@/stores/editor-store";

export function PreviewPane({ className }: { className?: string }) {
  const draft = useEditorStore((s) => s.draft)!;
  const device = useEditorStore((s) => s.previewDevice);
  const setDevice = useEditorStore((s) => s.setPreviewDevice);
  const replay = useEditorStore((s) => s.previewReplay);
  const replayPreview = useEditorStore((s) => s.replayPreview);
  const def = getTemplateOrFallback(draft.templateKey);
  const hasOpening = def.sections.includes("opening") && (draft.theme.sections.opening ?? true);

  const view = draftToView({
    id: draft.id,
    slug: draft.slug,
    status: draft.status,
    categorySlug: draft.categorySlug,
    templateKey: draft.templateKey,
    templateName: getTemplateOrFallback(draft.templateKey).name,
    templateTier: draft.templateTier,
    content: draft.content,
    theme: draft.theme,
    settings: draft.settings,
    functions: draft.functions,
    media: draft.media,
    publicUrl: draft.publicUrl,
    showBranding: showsBranding(draft.plan),
  });

  return (
    <div className={cn("flex h-full flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-muted-foreground">Live preview</p>
          {hasOpening ? (
            <Button variant="ghost" size="sm" onClick={replayPreview} data-testid="replay-opening">
              <RotateCcwIcon aria-hidden /> Replay opening
            </Button>
          ) : null}
        </div>
        <Tabs value={device} onValueChange={(v) => setDevice(v as "phone" | "desktop")}>
          <TabsList aria-label="Preview device" className="h-9">
            <TabsTrigger value="phone" className="h-7">
              <SmartphoneIcon aria-hidden /> <span className="sr-only sm:not-sr-only">Phone</span>
            </TabsTrigger>
            <TabsTrigger value="desktop" className="h-7">
              <MonitorIcon aria-hidden /> <span className="sr-only sm:not-sr-only">Desktop</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ErrorBoundary
        resetKey={draft.templateKey}
        fallback={<div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">The preview couldn't render. Your changes are still saved. Try switching template or reloading.</div>}
      >
        {device === "phone" ? (
          <div className="mx-auto w-full max-w-[21rem]" data-testid="preview-phone">
            <DeviceFrame label="Phone preview" decorative={false}>
              <InvitationRenderer key={replay} view={view} mode="preview" motion="full" />
            </DeviceFrame>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft" data-testid="preview-desktop" role="region" aria-label="Desktop preview">
            <div className="flex items-center gap-1.5 border-b border-border bg-subtle px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
              <span className="size-2.5 rounded-full bg-border" />
              <span className="ml-3 h-5 flex-1 truncate rounded-md bg-surface px-3 text-[10px] leading-5 text-muted-foreground">{draft.publicUrl}</span>
            </div>
            <div className="relative h-[75vh] overflow-y-auto [container-type:size]">
              <InvitationRenderer key={replay} view={view} mode="preview" motion="full" />
            </div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}

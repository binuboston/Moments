"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, CheckIcon, CloudOffIcon, EyeIcon, ImageIcon, Loader2Icon, PaletteIcon, PencilLineIcon, SendIcon, SettingsIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SwapTransition } from "@/components/motion/swap-transition";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/invitations/components/status-badge";
import { DetailsPanel } from "@/features/invitations/editor/panels/details-panel";
import { DesignPanel, type TemplateOption } from "@/features/invitations/editor/panels/design-panel";
import { PhotosPanel } from "@/features/invitations/editor/panels/photos-panel";
import { PublishPanel } from "@/features/invitations/editor/panels/publish-panel";
import { SchedulePanel } from "@/features/invitations/editor/panels/schedule-panel";
import { SettingsPanel } from "@/features/invitations/editor/panels/settings-panel";
import { PreviewPane } from "@/features/invitations/editor/preview-pane";
import { useAutosave } from "@/features/invitations/editor/use-autosave";
import type { InvitationDraft } from "@/features/invitations/types";
import { cn } from "@/lib/utils/cn";
import { isDirty, useEditorStore, type EditorStep } from "@/stores/editor-store";

const STEPS: { key: EditorStep; label: string; icon: typeof PencilLineIcon; description: string }[] = [
  { key: "details", label: "Details", icon: PencilLineIcon, description: "Names, date, venue" },
  { key: "schedule", label: "Schedule", icon: CalendarIcon, description: "Multiple functions" },
  { key: "photos", label: "Photos", icon: ImageIcon, description: "Cover and gallery" },
  { key: "design", label: "Design", icon: PaletteIcon, description: "Template, colours, type" },
  { key: "settings", label: "RSVP & settings", icon: SettingsIcon, description: "Responses, address" },
  { key: "publish", label: "Publish", icon: SendIcon, description: "Go live and share" },
];

function SaveIndicator({ testId = "save-indicator" }: { testId?: string }) {
  const saveState = useEditorStore((s) => s.saveState);
  const dirty = useEditorStore((s) => isDirty(s.draft, s.serverDraft));
  const label = saveState === "saving" ? "Saving…" : saveState === "error" ? "Not saved" : dirty ? "Unsaved changes" : saveState === "saved" ? "Saved" : "All changes saved";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", saveState === "error" ? "text-destructive" : "text-muted-foreground")} role="status" aria-live="polite" data-testid={testId}>
      {saveState === "saving" ? <Loader2Icon className="size-3.5 animate-spin" aria-hidden /> : saveState === "error" ? <CloudOffIcon className="size-3.5" aria-hidden /> : !dirty ? <CheckIcon className="size-3.5 text-success" aria-hidden /> : null}
      <span key={label} className="animate-fade-in">
        {label}
      </span>
    </span>
  );
}

export function InvitationEditor({ initialDraft, templates }: { initialDraft: InvitationDraft; templates: TemplateOption[] }) {
  const load = useEditorStore((s) => s.load);
  const reset = useEditorStore((s) => s.reset);
  const draft = useEditorStore((s) => s.draft);
  const step = useEditorStore((s) => s.step);
  const setStep = useEditorStore((s) => s.setStep);
  const mobilePreviewOpen = useEditorStore((s) => s.mobilePreviewOpen);
  const setMobilePreviewOpen = useEditorStore((s) => s.setMobilePreviewOpen);

  useEffect(() => {
    load(initialDraft);
    return () => reset();
  }, [initialDraft, load, reset]);

  useAutosave();

  // Keep the active step visible in the horizontally scrolling step bar (phones).
  const stepsRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = stepsRef.current;
    const active = list?.querySelector<HTMLElement>(`[data-testid="step-${step}"]`);
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
    window.scrollTo({ top: 0 });
  }, [step]);

  if (!draft || draft.id !== initialDraft.id) return null;

  const title = draft.title || (draft.content as { headline?: string }).headline || "Untitled invitation";
  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="editor-scope -mx-4 -my-6 flex min-h-[calc(100dvh-3.5rem)] flex-col sm:-mx-6 sm:-my-8 sm:min-h-[calc(100dvh-4rem)] lg:-mx-10">
      {/* Fixed-height toolbar so the step nav below can be sticky at a known offset on small screens. */}
      <div className="sticky top-14 z-20 flex h-14 items-center justify-between gap-2 border-b border-border bg-background/90 px-3 backdrop-blur-md sm:top-16 sm:gap-3 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
          <Button asChild variant="ghost" size="icon-sm" aria-label="Back to invitations">
            <Link href="/dashboard/invitations">
              <ArrowLeftIcon />
            </Link>
          </Button>
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="min-w-0 truncate text-sm font-semibold sm:text-base">{title}</h1>
            <div className="hidden items-center gap-2 sm:flex">
              <StatusBadge status={draft.status} />
              <SaveIndicator />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {step !== "publish" ? (
            <Button size="sm" onClick={() => setStep("publish")} data-testid="go-to-publish">
              <SendIcon aria-hidden /> Publish
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)_minmax(22rem,30rem)]">
        {/* Sticky under the toolbar (4rem header + 3.5rem toolbar) on small screens; a static sidebar column on large screens. */}
        <nav aria-label="Editor steps" className="sticky top-28 z-10 min-w-0 max-w-full border-b border-border bg-surface sm:top-30 lg:static lg:border-r lg:border-b-0">
          <div className="flex items-center gap-2 px-3 pt-2 sm:hidden">
            <StatusBadge status={draft.status} />
            <SaveIndicator testId="save-indicator-mobile" />
          </div>
          <ol ref={stepsRef} className="flex overflow-x-auto scroll-px-2 p-2 no-scrollbar lg:flex-col lg:p-3">
            {STEPS.map((s, i) => {
              const active = s.key === step;
              return (
                <li key={s.key} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setStep(s.key)}
                    aria-current={active ? "step" : undefined}
                    data-testid={`step-${s.key}`}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold", active ? "bg-primary text-primary-foreground" : "bg-muted")}>{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block font-medium whitespace-nowrap">{s.label}</span>
                      <span className="hidden text-xs text-muted-foreground lg:block">{s.description}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="min-w-0 px-4 pt-5 pb-28 sm:px-6 sm:pt-6 lg:px-8 lg:pb-6" aria-labelledby={`step-heading-${step}`}>
          <h2 id={`step-heading-${step}`} className="sr-only">
            {STEPS[stepIndex]?.label}
          </h2>
          <div className="mx-auto max-w-2xl">
            <SwapTransition swapKey={step}>
              {step === "details" ? <DetailsPanel key={draft.categorySlug} /> : null}
              {step === "schedule" ? <SchedulePanel /> : null}
              {step === "photos" ? <PhotosPanel /> : null}
              {step === "design" ? <DesignPanel templates={templates} /> : null}
              {step === "settings" ? <SettingsPanel /> : null}
              {step === "publish" ? <PublishPanel /> : null}
            </SwapTransition>

            <div className="mt-10 hidden items-center justify-between border-t border-border pt-6 lg:flex">
              <Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStep(STEPS[stepIndex - 1].key)}>
                Back
              </Button>
              {stepIndex < STEPS.length - 1 ? (
                <Button variant="outline" onClick={() => setStep(STEPS[stepIndex + 1].key)} data-testid="next-step">
                  Next: {STEPS[stepIndex + 1].label}
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="hidden border-l border-border bg-subtle/50 p-6 lg:block">
          <div className="sticky top-[8.5rem]">
            <PreviewPane />
          </div>
        </aside>
      </div>

      {/* Phones and tablets: thumb-reachable step controls with the preview one tap away. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-3 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <Button variant="ghost" size="icon" disabled={stepIndex === 0} onClick={() => setStep(STEPS[stepIndex - 1].key)} aria-label="Previous step">
            <ArrowLeftIcon />
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setMobilePreviewOpen(true)}>
            <EyeIcon aria-hidden /> Preview
          </Button>
          {stepIndex < STEPS.length - 1 ? (
            <Button className="flex-1" onClick={() => setStep(STEPS[stepIndex + 1].key)} data-testid="next-step-mobile">
              {STEPS[stepIndex + 1].label.split(" ")[0]} <ArrowRightIcon aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>

      <DialogPrimitive.Root open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/40 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out lg:hidden" />
          <DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col bg-background p-4 outline-none data-[state=open]:animate-sheet-up data-[state=closed]:animate-sheet-down lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <DialogPrimitive.Title className="text-sm font-semibold">Preview</DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" aria-label="Close preview">
                  <XIcon />
                </Button>
              </DialogPrimitive.Close>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <PreviewPane />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

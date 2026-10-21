"use client";

import { ArrowLeftIcon, CheckIcon, CloudOffIcon, Loader2Icon, SendIcon, Settings2Icon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SwapTransition } from "@/components/motion/swap-transition";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/features/invitations/components/status-badge";
import { ContentFormProvider } from "@/features/invitations/editor/content-form";
import { EditorStepper } from "@/features/invitations/editor/editor-stepper";
import { StepNav } from "@/features/invitations/editor/step-nav";
import { useMediaQuery, WIDE_SCREEN } from "@/hooks/use-media-query";
import type { TemplateOption } from "@/features/invitations/editor/panels/design-panel";
import { PublishPanel } from "@/features/invitations/editor/panels/publish-panel";
import { SettingsPanel } from "@/features/invitations/editor/panels/settings-panel";
import { PreviewPane } from "@/features/invitations/editor/preview-pane";
import { TemplateSwitcher } from "@/features/invitations/editor/template-switcher";
import { useAutosave } from "@/features/invitations/editor/use-autosave";
import { ViewToggle } from "@/features/invitations/editor/view-toggle";
import type { InvitationDraft } from "@/features/invitations/types";
import { cn } from "@/lib/utils/cn";
import { isDirty, useEditorStore } from "@/stores/editor-store";
import { ROUTES } from "@/lib/routes";

function SaveIndicator() {
  const saveState = useEditorStore((s) => s.saveState);
  const dirty = useEditorStore((s) => isDirty(s.draft, s.serverDraft));
  const label = saveState === "saving" ? "Saving…" : saveState === "error" ? "Not saved" : dirty ? "Unsaved changes" : saveState === "saved" ? "Saved" : "All changes saved";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", saveState === "error" ? "text-destructive" : "text-muted-foreground")} role="status" aria-live="polite" data-testid="save-indicator">
      {saveState === "saving" ? <Loader2Icon className="size-3.5 animate-spin" aria-hidden /> : saveState === "error" ? <CloudOffIcon className="size-3.5" aria-hidden /> : !dirty ? <CheckIcon className="size-3.5 text-success" aria-hidden /> : null}
      <span key={label} className="animate-fade-in">
        {label}
      </span>
    </span>
  );
}

/**
 * Invitation editor: a floating toolbar (back, design switcher, settings,
 * Edit/Preview, publish) over one calm column. Edit shows collapsible section
 * cards; Preview shows the invitation as guests see it. Settings and publishing
 * open as sheets so the page never loses its place.
 */
export function InvitationEditor({ initialDraft, templates, isGuest = false }: { initialDraft: InvitationDraft; templates: TemplateOption[]; isGuest?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const load = useEditorStore((s) => s.load);
  const reset = useEditorStore((s) => s.reset);
  const draft = useEditorStore((s) => s.draft);
  const view = useEditorStore((s) => s.view);
  const wide = useMediaQuery(WIDE_SCREEN);
  const settingsOpen = useEditorStore((s) => s.settingsOpen);
  const setSettingsOpen = useEditorStore((s) => s.setSettingsOpen);
  const publishOpen = useEditorStore((s) => s.publishOpen);
  const setPublishOpen = useEditorStore((s) => s.setPublishOpen);

  // Fresh server data for the same invitation (refresh) updates the draft and keeps the UI;
  // a full reset happens only when leaving or switching to another invitation.
  useEffect(() => {
    load(initialDraft);
  }, [initialDraft, load]);
  useEffect(() => () => reset(), [initialDraft.id, reset]);

  useAutosave();

  // ?publish=1 (after signing in from the publish sheet, or returning from Google): reopen it.
  const loaded = draft?.id === initialDraft.id;
  useEffect(() => {
    if (!loaded || searchParams.get("publish") !== "1") return;
    setPublishOpen(true);
    router.replace(pathname, { scroll: false });
  }, [loaded, searchParams, setPublishOpen, router, pathname]);

  // Switching views starts at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  if (!draft || draft.id !== initialDraft.id) return null;

  const content = draft.content as { headline?: string };
  const title = draft.title || content.headline || "Untitled invitation";
  return (
    <div className="editor-scope">
      {/* Editor controls as a floating bottom bar (thumb-reachable on phones, out of the way of the content). */}
      <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-3xl md:left-[calc(4.5rem+0.75rem)]" data-testid="editor-bar">
        <div className="surface-float rounded-3xl p-2">
          {/* Phones: Back / Next live here, always within thumb reach. */}
          {view === "edit" && !wide ? <StepNav variant="bar" className="mb-2 border-b border-border pb-2" /> : null}
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 sm:grid-cols-[1fr_auto_1fr] sm:gap-2">
            <div className="flex min-w-0 items-center gap-1 sm:gap-2">
              {/* On phones the step bar above has its own back arrow; leaving the editor is a close button there. */}
              <Button asChild variant="ghost" size="icon-sm" aria-label={wide ? "Back to invitations" : "Close editor"}>
                <Link href={ROUTES.invitations}>{wide ? <ArrowLeftIcon /> : <XIcon />}</Link>
              </Button>
              <TemplateSwitcher templates={templates} />
              <Button variant="soft" size="icon-sm" onClick={() => setSettingsOpen(true)} aria-label="RSVP and settings" data-testid="open-settings">
                <Settings2Icon />
              </Button>
            </div>
            <ViewToggle compact={!wide} className="w-full sm:w-56" />
            <div className="flex items-center justify-end">
              <Button size="sm" onClick={() => setPublishOpen(true)} data-testid="go-to-publish">
                <SendIcon aria-hidden /> {draft.status === "published" ? "Share" : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SwapTransition swapKey={view}>
        {view === "edit" ? (
          <div className="mx-auto grid w-full max-w-3xl grid-cols-[minmax(0,1fr)] gap-4 pb-44 sm:pb-28">
            {/* Phones: one line (title, then status and save state); stacked from tablet size. */}
            <header className="mb-1 flex items-center gap-3 px-1 sm:block">
              <h1 className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight sm:text-3xl sm:text-balance sm:whitespace-normal">{title}</h1>
              <div className="flex shrink-0 flex-wrap items-center gap-3 sm:mt-2">
                <StatusBadge status={draft.status} />
                <SaveIndicator />
              </div>
            </header>

            <ContentFormProvider key={draft.categorySlug}>
              <EditorStepper />
            </ContentFormProvider>
          </div>
        ) : (
          <div className="pb-40 sm:pb-28">
            <PreviewPane />
          </div>
        )}
      </SwapTransition>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>RSVP &amp; settings</DialogTitle>
            <DialogDescription>Responses, calendar buttons and the opening card.</DialogDescription>
          </DialogHeader>
          <SettingsPanel />
        </DialogContent>
      </Dialog>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{draft.status === "published" ? "Your invitation is live" : "Publish"}</DialogTitle>
            <DialogDescription>Check everything is ready, choose your link and share it.</DialogDescription>
          </DialogHeader>
          <PublishPanel isGuest={isGuest} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

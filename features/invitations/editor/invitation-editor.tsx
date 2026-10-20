"use client";

import { ArrowLeftIcon, CalendarClockIcon, CheckIcon, CloudOffIcon, ImageIcon, Loader2Icon, PaletteIcon, SendIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SwapTransition } from "@/components/motion/swap-transition";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/features/invitations/components/status-badge";
import { EditorSection } from "@/features/invitations/editor/editor-section";
import { DesignPanel, type TemplateOption } from "@/features/invitations/editor/panels/design-panel";
import { DetailsPanel } from "@/features/invitations/editor/panels/details-panel";
import { PhotosPanel } from "@/features/invitations/editor/panels/photos-panel";
import { PublishPanel } from "@/features/invitations/editor/panels/publish-panel";
import { SchedulePanel } from "@/features/invitations/editor/panels/schedule-panel";
import { SettingsPanel } from "@/features/invitations/editor/panels/settings-panel";
import { PreviewPane } from "@/features/invitations/editor/preview-pane";
import { TemplateSwitcher } from "@/features/invitations/editor/template-switcher";
import { useAutosave } from "@/features/invitations/editor/use-autosave";
import { ViewToggle } from "@/features/invitations/editor/view-toggle";
import type { InvitationDraft } from "@/features/invitations/types";
import { getTemplateOrFallback } from "@/features/templates/registry";
import { categoryStyle } from "@/lib/design/tones";
import { cn } from "@/lib/utils/cn";
import { formatShortDate } from "@/lib/utils/dates";
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

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

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
  const settingsOpen = useEditorStore((s) => s.settingsOpen);
  const setSettingsOpen = useEditorStore((s) => s.setSettingsOpen);
  const publishOpen = useEditorStore((s) => s.publishOpen);
  const setPublishOpen = useEditorStore((s) => s.setPublishOpen);
  const focusTarget = useEditorStore((s) => s.focusTarget);
  const clearFocusTarget = useEditorStore((s) => s.clearFocusTarget);

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

  // goTo(): once the section has started opening, bring it into view.
  useEffect(() => {
    if (!focusTarget) return;
    const t = setTimeout(() => {
      document.getElementById(`editor-${focusTarget}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      clearFocusTarget();
    }, 120);
    return () => clearTimeout(t);
  }, [focusTarget, clearFocusTarget]);

  // Switching views starts at the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  if (!draft || draft.id !== initialDraft.id) return null;

  const content = draft.content as { headline?: string; startsAt?: string; timezone?: string; venue?: { name?: string } };
  const title = draft.title || content.headline || "Untitled invitation";
  const def = getTemplateOrFallback(draft.templateKey);
  const palette = def.palettes.find((p) => p.id === (draft.theme.paletteId || def.defaults.paletteId));
  const fonts = def.fontPairings.find((f) => f.id === (draft.theme.fontPairingId || def.defaults.fontPairingId));
  const cover = draft.media.some((m) => m.kind === "cover");
  const gallery = draft.media.filter((m) => m.kind === "gallery").length;
  const category = categoryStyle(draft.categorySlug);

  const summaries = {
    details: [content.headline, content.startsAt ? formatShortDate(content.startsAt, content.timezone ?? "UTC") : "", content.venue?.name].filter(Boolean).join(" · ") || "Names, date and venue",
    schedule: draft.functions.length ? plural(draft.functions.length, "event") : "Add ceremonies, receptions or a running order",
    photos: cover || gallery ? [cover ? "Cover photo" : "", gallery ? plural(gallery, "gallery photo") : ""].filter(Boolean).join(" · ") : "Cover and gallery",
    design: [palette?.name, fonts?.name].filter(Boolean).join(" · "),
  };

  return (
    <div className="editor-scope">
      {/* Editor controls as a floating bottom bar (thumb-reachable on phones, out of the way of the content). */}
      <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-3xl" data-testid="editor-bar">
        <div className="surface-float grid grid-cols-[1fr_auto] items-center gap-2 rounded-3xl p-2 sm:grid-cols-[1fr_auto_1fr]">
          <ViewToggle className="col-span-2 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:w-56" />
          <div className="flex min-w-0 items-center gap-1.5 sm:col-start-1 sm:row-start-1 sm:gap-2">
            <Button asChild variant="ghost" size="icon-sm" aria-label="Back to invitations">
              <Link href={ROUTES.invitations}>
                <ArrowLeftIcon />
              </Link>
            </Button>
            <TemplateSwitcher templates={templates} />
            <Button variant="soft" size="icon-sm" onClick={() => setSettingsOpen(true)} aria-label="RSVP and settings" data-testid="open-settings">
              <Settings2Icon />
            </Button>
          </div>
          <div className="flex items-center justify-end sm:col-start-3 sm:row-start-1">
            <Button size="sm" onClick={() => setPublishOpen(true)} data-testid="go-to-publish">
              <SendIcon aria-hidden /> {draft.status === "published" ? "Share" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <SwapTransition swapKey={view}>
        {view === "edit" ? (
          <div className="mx-auto grid w-full max-w-3xl gap-4 pb-40 sm:pb-28">
            <header className="mb-1 px-1">
              <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <StatusBadge status={draft.status} />
                <SaveIndicator />
              </div>
            </header>

            <EditorSection id="details" title="Basic information" summary={summaries.details} icon={category.icon} tone={category.tone}>
              <DetailsPanel key={draft.categorySlug} />
            </EditorSection>
            <EditorSection id="schedule" title="Schedule" summary={summaries.schedule} icon={CalendarClockIcon} tone="amber">
              <SchedulePanel />
            </EditorSection>
            <EditorSection id="photos" title="Photos" summary={summaries.photos} icon={ImageIcon} tone="teal">
              <PhotosPanel />
            </EditorSection>
            <EditorSection id="design" title="Look & feel" summary={summaries.design} icon={PaletteIcon} tone="violet">
              <DesignPanel />
            </EditorSection>
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

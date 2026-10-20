"use client";

import { create } from "zustand";
import type { InvitationContentInput } from "@/lib/validation/content";
import type { InvitationFunctionInput } from "@/lib/validation/functions";
import type { InvitationSettings } from "@/lib/validation/settings";
import type { ThemeInput } from "@/lib/validation/theme";
import type { InvitationDraft, MediaRecord } from "@/features/invitations/types";

export type EditorStep = "details" | "schedule" | "photos" | "design" | "settings" | "publish";
export type SaveState = "idle" | "saving" | "saved" | "error";

interface EditorState {
  draft: InvitationDraft | null;
  /** The last version confirmed by the server. Used to compute autosave diffs. */
  serverDraft: InvitationDraft | null;
  step: EditorStep;
  saveState: SaveState;
  lastSavedAt: number | null;
  previewDevice: "phone" | "desktop";
  mobilePreviewOpen: boolean;
  /** Incremented to remount the preview and replay the opening animation. */
  previewReplay: number;
  replayPreview: () => void;

  load: (draft: InvitationDraft) => void;
  reset: () => void;
  setStep: (step: EditorStep) => void;
  setPreviewDevice: (device: "phone" | "desktop") => void;
  setMobilePreviewOpen: (open: boolean) => void;

  setContent: (content: InvitationContentInput) => void;
  setTitle: (title: string) => void;
  setTheme: (patch: Partial<ThemeInput>) => void;
  setSectionVisible: (key: keyof ThemeInput["sections"], visible: boolean) => void;
  setSettings: (patch: Partial<InvitationSettings>) => void;
  setRsvpSettings: (patch: Partial<InvitationSettings["rsvp"]>) => void;
  setFunctions: (functions: InvitationFunctionInput[]) => void;
  setMedia: (media: MediaRecord[]) => void;
  /** Media is persisted through its own API; keep both copies aligned. */
  syncMedia: (media: MediaRecord[]) => void;
  syncStatus: (patch: Pick<InvitationDraft, "status" | "publishedAt" | "slug">) => void;
  setTemplate: (template: { key: string; slug: string; tier: "free" | "premium" }) => void;

  markSaving: () => void;
  markSaved: (serverDraft: InvitationDraft) => void;
  markError: () => void;
}

const patchDraft = (set: (fn: (s: EditorState) => Partial<EditorState>) => void, patch: (d: InvitationDraft) => Partial<InvitationDraft>) =>
  set((s) => (s.draft ? { draft: { ...s.draft, ...patch(s.draft) } } : {}));

export const useEditorStore = create<EditorState>()((set) => ({
  draft: null,
  serverDraft: null,
  step: "details",
  saveState: "idle",
  lastSavedAt: null,
  previewDevice: "phone",
  mobilePreviewOpen: false,
  previewReplay: 0,
  replayPreview: () => set((s) => ({ previewReplay: s.previewReplay + 1 })),

  load: (draft) => set({ draft, serverDraft: draft, saveState: "idle", step: "details" }),
  reset: () => set({ draft: null, serverDraft: null, saveState: "idle", lastSavedAt: null, step: "details", mobilePreviewOpen: false }),
  setStep: (step) => set({ step }),
  setPreviewDevice: (previewDevice) => set({ previewDevice }),
  setMobilePreviewOpen: (mobilePreviewOpen) => set({ mobilePreviewOpen }),

  setContent: (content) => patchDraft(set, () => ({ content })),
  setTitle: (title) => patchDraft(set, () => ({ title })),
  setTheme: (patch) => patchDraft(set, (d) => ({ theme: { ...d.theme, ...patch } })),
  setSectionVisible: (key, visible) => patchDraft(set, (d) => ({ theme: { ...d.theme, sections: { ...d.theme.sections, [key]: visible } } })),
  setSettings: (patch) => patchDraft(set, (d) => ({ settings: { ...d.settings, ...patch } })),
  setRsvpSettings: (patch) => patchDraft(set, (d) => ({ settings: { ...d.settings, rsvp: { ...d.settings.rsvp, ...patch } } })),
  setFunctions: (functions) => patchDraft(set, () => ({ functions })),
  setMedia: (media) => patchDraft(set, () => ({ media })),
  syncMedia: (media) =>
    set((s) => ({
      draft: s.draft ? { ...s.draft, media } : s.draft,
      serverDraft: s.serverDraft ? { ...s.serverDraft, media } : s.serverDraft,
    })),
  syncStatus: (patch) =>
    set((s) => ({
      draft: s.draft ? { ...s.draft, ...patch } : s.draft,
      serverDraft: s.serverDraft ? { ...s.serverDraft, ...patch } : s.serverDraft,
    })),
  setTemplate: (template) =>
    patchDraft(set, () => ({
      templateKey: template.key,
      templateSlug: template.slug,
      templateTier: template.tier,
      // Palette/font ids are template-specific; fall back to the new template's defaults.
      theme: { paletteId: "", fontPairingId: "", sections: {} },
    })),

  markSaving: () => set({ saveState: "saving" }),
  markSaved: (serverDraft) =>
    set((s) => ({
      serverDraft,
      saveState: "saved",
      lastSavedAt: Date.now(),
      // Keep local media/slug in sync with the server while preserving in-progress edits.
      draft: s.draft ? { ...s.draft, media: serverDraft.media, slug: serverDraft.slug, status: serverDraft.status, publishedAt: serverDraft.publishedAt, updatedAt: serverDraft.updatedAt } : serverDraft,
    })),
  markError: () => set({ saveState: "error" }),
}));

/** Fields the autosave compares and sends. Media and slug are managed by explicit actions. */
export function computeDiff(draft: InvitationDraft, server: InvitationDraft) {
  const diff: {
    title?: string;
    content?: InvitationContentInput;
    theme?: ThemeInput;
    settings?: InvitationSettings;
    functions?: InvitationFunctionInput[];
    templateSlug?: string;
  } = {};
  if (draft.title !== server.title) diff.title = draft.title;
  if (JSON.stringify(draft.content) !== JSON.stringify(server.content)) diff.content = draft.content;
  if (JSON.stringify(draft.theme) !== JSON.stringify(server.theme)) diff.theme = draft.theme;
  if (JSON.stringify(draft.settings) !== JSON.stringify(server.settings)) diff.settings = draft.settings;
  if (JSON.stringify(draft.functions) !== JSON.stringify(server.functions)) diff.functions = draft.functions;
  if (draft.templateSlug !== server.templateSlug) diff.templateSlug = draft.templateSlug;
  return diff;
}

export function isDirty(draft: InvitationDraft | null, server: InvitationDraft | null): boolean {
  if (!draft || !server) return false;
  return Object.keys(computeDiff(draft, server)).length > 0;
}

"use client";

import { create } from "zustand";
import type { InvitationContentInput } from "@/lib/validation/content";
import type { InvitationFunctionInput } from "@/lib/validation/functions";
import type { InvitationSettings } from "@/lib/validation/settings";
import type { ThemeInput } from "@/lib/validation/theme";
import type { InvitationDraft, MediaRecord } from "@/features/invitations/types";

/** Collapsible sections of the Edit view. */
export type EditorSection = "details" | "schedule" | "photos" | "design";
/** Anything the editor can navigate to: a section, or the settings sheet. */
export type EditorTarget = EditorSection | "settings";
export type EditorView = "edit" | "preview";
export type SaveState = "idle" | "saving" | "saved" | "error";

interface EditorState {
  draft: InvitationDraft | null;
  /** The last version confirmed by the server. Used to compute autosave diffs. */
  serverDraft: InvitationDraft | null;
  saveState: SaveState;
  lastSavedAt: number | null;
  view: EditorView;
  openSections: EditorSection[];
  settingsOpen: boolean;
  publishOpen: boolean;
  /** Set by goTo(); the editor scrolls the section into view, then clears it. */
  focusTarget: EditorSection | null;

  load: (draft: InvitationDraft) => void;
  reset: () => void;
  setView: (view: EditorView) => void;
  toggleSection: (section: EditorSection, open?: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setPublishOpen: (open: boolean) => void;
  /** Jump to where something is edited (e.g. from a publish check): opens it and closes the publish sheet. */
  goTo: (target: EditorTarget) => void;
  clearFocusTarget: () => void;

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

const UI_DEFAULTS = {
  view: "edit" as EditorView,
  openSections: ["details"] as EditorSection[],
  settingsOpen: false,
  publishOpen: false,
  focusTarget: null as EditorSection | null,
};

const patchDraft = (set: (fn: (s: EditorState) => Partial<EditorState>) => void, patch: (d: InvitationDraft) => Partial<InvitationDraft>) =>
  set((s) => (s.draft ? { draft: { ...s.draft, ...patch(s.draft) } } : {}));

export const useEditorStore = create<EditorState>()((set) => ({
  draft: null,
  serverDraft: null,
  saveState: "idle",
  lastSavedAt: null,
  ...UI_DEFAULTS,

  load: (draft) => set({ draft, serverDraft: draft, saveState: "idle", ...UI_DEFAULTS }),
  reset: () => set({ draft: null, serverDraft: null, saveState: "idle", lastSavedAt: null, ...UI_DEFAULTS }),
  setView: (view) => set({ view }),
  toggleSection: (section, open) =>
    set((s) => {
      const isOpen = s.openSections.includes(section);
      const next = open ?? !isOpen;
      if (next === isOpen) return {};
      return { openSections: next ? [...s.openSections, section] : s.openSections.filter((k) => k !== section) };
    }),
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
  setPublishOpen: (publishOpen) => set({ publishOpen }),
  goTo: (target) =>
    set((s) =>
      target === "settings"
        ? { publishOpen: false, settingsOpen: true }
        : { publishOpen: false, view: "edit", openSections: s.openSections.includes(target) ? s.openSections : [...s.openSections, target], focusTarget: target },
    ),
  clearFocusTarget: () => set({ focusTarget: null }),

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

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { invitationKeys, invitationsApi } from "@/features/invitations/api";
import { errorMessage } from "@/features/invitations/hooks";
import { computeDiff, isDirty, useEditorStore } from "@/stores/editor-store";

const DEBOUNCE_MS = 1200;

/**
 * Debounced autosave. Sends only the parts of the draft that changed since the
 * last server confirmation. Warns before the tab closes while unsaved.
 */
export function useAutosave() {
  const qc = useQueryClient();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    const save = async () => {
      const { draft, serverDraft, markSaving, markSaved, markError } = useEditorStore.getState();
      if (!draft || !serverDraft || inFlight.current) return;
      const diff = computeDiff(draft, serverDraft);
      if (Object.keys(diff).length === 0) return;
      inFlight.current = true;
      markSaving();
      try {
        const saved = await invitationsApi.update(draft.id, diff);
        markSaved(saved);
        qc.setQueryData(invitationKeys.detail(draft.id), saved);
        void qc.invalidateQueries({ queryKey: invitationKeys.all, refetchType: "none" });
      } catch (err) {
        markError();
        toast.error(errorMessage(err, "We couldn't save your changes."));
      } finally {
        inFlight.current = false;
        // Changes may have arrived during the request.
        const s = useEditorStore.getState();
        if (isDirty(s.draft, s.serverDraft)) schedule();
      }
    };

    const schedule = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(save, DEBOUNCE_MS);
    };

    const unsubscribe = useEditorStore.subscribe((state, prev) => {
      if (state.draft !== prev.draft && isDirty(state.draft, state.serverDraft)) schedule();
    });

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      const s = useEditorStore.getState();
      if (s.saveState === "saving" || isDirty(s.draft, s.serverDraft)) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [qc]);
}

/** Flushes pending changes immediately (used before publish). */
export async function flushSave(): Promise<void> {
  const { draft, serverDraft, markSaving, markSaved, markError } = useEditorStore.getState();
  if (!draft || !serverDraft) return;
  const diff = computeDiff(draft, serverDraft);
  if (Object.keys(diff).length === 0) return;
  markSaving();
  try {
    const saved = await invitationsApi.update(draft.id, diff);
    markSaved(saved);
  } catch (err) {
    markError();
    throw err;
  }
}

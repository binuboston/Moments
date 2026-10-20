"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiClientError } from "@/lib/api/client";
import { invitationKeys, invitationsApi, type ListParams } from "@/features/invitations/api";
import type { InvitationDraft, InvitationListItem, InvitationListResponse } from "@/features/invitations/types";

export function useInvitationList(params: ListParams, initialData?: InvitationListResponse) {
  return useQuery({
    queryKey: invitationKeys.list(params),
    queryFn: () => invitationsApi.list(params),
    initialData,
    placeholderData: keepPreviousData,
  });
}

export function useInvitation(id: string, initialData?: InvitationDraft) {
  return useQuery({
    queryKey: invitationKeys.detail(id),
    queryFn: () => invitationsApi.get(id),
    initialData,
    staleTime: Infinity,
  });
}

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ApiClientError) return err.message;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

/** Shared mutations for list cards and the editor. Each invalidates the relevant queries. */
type ListSnapshot = [readonly unknown[], InvitationListResponse | undefined][];
type CountKey = keyof InvitationListResponse["counts"];

/** Apply a change to every cached invitation list (all filters and pages). */
function patchLists(qc: ReturnType<typeof useQueryClient>, update: (list: InvitationListResponse) => InvitationListResponse): ListSnapshot {
  const filter = { queryKey: invitationKeys.all, predicate: (q: { queryKey: readonly unknown[] }) => q.queryKey[1] === "list" };
  const snapshot = qc.getQueriesData<InvitationListResponse>(filter);
  qc.setQueriesData<InvitationListResponse>(filter, (old) => (old ? update(old) : old));
  return snapshot;
}

function restore(qc: ReturnType<typeof useQueryClient>, snapshot: ListSnapshot | undefined) {
  snapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
}

function moveCount(counts: InvitationListResponse["counts"], from: CountKey, to: CountKey | null): InvitationListResponse["counts"] {
  const next = { ...counts, [from]: Math.max(0, counts[from] - 1) };
  if (to) next[to] += 1;
  else next.all = Math.max(0, next.all - 1);
  return next;
}

/**
 * Shared mutations for list cards and the editor.
 * Publish, unpublish and delete update cached lists optimistically (instant UI,
 * rolled back on error). Every mutation then revalidates queries and refreshes
 * server-rendered pages such as the dashboard overview.
 */
export function useInvitationMutations() {
  const qc = useQueryClient();
  const router = useRouter();
  const settle = (id?: string) => {
    void qc.invalidateQueries({ queryKey: invitationKeys.all });
    if (id) void qc.invalidateQueries({ queryKey: invitationKeys.detail(id) });
    router.refresh();
  };

  const setStatus = (id: string, status: InvitationListItem["status"]) =>
    patchLists(qc, (list) => {
      const item = list.items.find((i) => i.id === id);
      if (!item || item.status === status) return list;
      return { ...list, counts: moveCount(list.counts, item.status, status), items: list.items.map((i) => (i.id === id ? { ...i, status } : i)) };
    });

  const publish = useMutation({
    mutationFn: (id: string) => invitationsApi.publish(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: invitationKeys.all });
      return { snapshot: setStatus(id, "published") };
    },
    onError: (err, _id, ctx) => {
      restore(qc, ctx?.snapshot);
      toast.error(errorMessage(err));
    },
    onSettled: (_d, _e, id) => settle(id),
  });

  const unpublish = useMutation({
    mutationFn: (id: string) => invitationsApi.unpublish(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: invitationKeys.all });
      return { snapshot: setStatus(id, "unpublished") };
    },
    onSuccess: () => toast.success("Invitation unpublished. The link no longer works."),
    onError: (err, _id, ctx) => {
      restore(qc, ctx?.snapshot);
      toast.error(errorMessage(err));
    },
    onSettled: (_d, _e, id) => settle(id),
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => invitationsApi.duplicate(id),
    onSuccess: () => toast.success("Invitation duplicated as a new draft."),
    onError: (err) => toast.error(errorMessage(err)),
    onSettled: () => settle(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => invitationsApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: invitationKeys.all });
      const snapshot = patchLists(qc, (list) => {
        const item = list.items.find((i) => i.id === id);
        if (!item) return list;
        return { ...list, total: Math.max(0, list.total - 1), counts: moveCount(list.counts, item.status, null), items: list.items.filter((i) => i.id !== id) };
      });
      return { snapshot };
    },
    onSuccess: () => toast.success("Invitation deleted."),
    onError: (err, _id, ctx) => {
      restore(qc, ctx?.snapshot);
      toast.error(errorMessage(err));
    },
    onSettled: () => settle(),
  });

  return { publish, unpublish, duplicate, remove };
}

"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiClientError } from "@/lib/api/client";
import { invitationKeys, invitationsApi, type ListParams } from "@/features/invitations/api";
import type { InvitationDraft, InvitationListResponse } from "@/features/invitations/types";

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
export function useInvitationMutations() {
  const qc = useQueryClient();
  const invalidate = (id?: string) => {
    void qc.invalidateQueries({ queryKey: invitationKeys.all });
    if (id) void qc.invalidateQueries({ queryKey: invitationKeys.detail(id) });
  };

  const publish = useMutation({
    mutationFn: (id: string) => invitationsApi.publish(id),
    onSuccess: (_data, id) => invalidate(id),
    onError: (err) => toast.error(errorMessage(err)),
  });
  const unpublish = useMutation({
    mutationFn: (id: string) => invitationsApi.unpublish(id),
    onSuccess: (_data, id) => {
      invalidate(id);
      toast.success("Invitation unpublished. The link no longer works.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const duplicate = useMutation({
    mutationFn: (id: string) => invitationsApi.duplicate(id),
    onSuccess: () => {
      invalidate();
      toast.success("Invitation duplicated as a new draft.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => invitationsApi.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success("Invitation deleted.");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  return { publish, unpublish, duplicate, remove };
}

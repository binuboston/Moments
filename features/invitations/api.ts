"use client";

import { apiFetch } from "@/lib/api/client";
import type { UpdateInvitationInput } from "@/lib/validation/invitation";
import type { CategorySlug } from "@/types/domain";
import type { InvitationDraft, InvitationListResponse, RsvpItem, RsvpSummary } from "@/features/invitations/types";

export interface ListParams {
  status?: "all" | "draft" | "published" | "unpublished";
  q?: string;
  page?: number;
  pageSize?: number;
}

export const invitationKeys = {
  all: ["invitations"] as const,
  list: (params: ListParams) => ["invitations", "list", params] as const,
  detail: (id: string) => ["invitations", "detail", id] as const,
  rsvps: (id: string) => ["invitations", "rsvps", id] as const,
};

export const invitationsApi = {
  list: (params: ListParams) => {
    const sp = new URLSearchParams();
    if (params.status && params.status !== "all") sp.set("status", params.status);
    if (params.q) sp.set("q", params.q);
    if (params.page) sp.set("page", String(params.page));
    if (params.pageSize) sp.set("pageSize", String(params.pageSize));
    const qs = sp.toString();
    return apiFetch<InvitationListResponse>(`/api/invitations${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => apiFetch<InvitationDraft>(`/api/invitations/${id}`),
  create: (body: { categorySlug: CategorySlug; templateSlug: string; timezone?: string }) =>
    apiFetch<{ id: string; slug: string }>("/api/invitations", { method: "POST", json: body }),
  update: (id: string, body: UpdateInvitationInput) => apiFetch<InvitationDraft>(`/api/invitations/${id}`, { method: "PATCH", json: body }),
  remove: (id: string) => apiFetch<{ ok: true }>(`/api/invitations/${id}`, { method: "DELETE" }),
  publish: (id: string) => apiFetch<{ ok: true; slug: string; url: string }>(`/api/invitations/${id}/publish`, { method: "POST" }),
  unpublish: (id: string) => apiFetch<{ ok: true }>(`/api/invitations/${id}/unpublish`, { method: "POST" }),
  duplicate: (id: string) => apiFetch<{ id: string; slug: string }>(`/api/invitations/${id}/duplicate`, { method: "POST" }),
  rsvps: (id: string) => apiFetch<{ items: RsvpItem[]; summary: RsvpSummary }>(`/api/invitations/${id}/rsvps`),
  deleteRsvp: (id: string, rsvpId: string) => apiFetch<{ ok: true }>(`/api/invitations/${id}/rsvps/${rsvpId}`, { method: "DELETE" }),
  slugAvailable: (slug: string, exclude?: string) =>
    apiFetch<{ available: boolean; reason?: string; slug?: string }>(`/api/slug-availability?slug=${encodeURIComponent(slug)}${exclude ? `&exclude=${exclude}` : ""}`),
};

export const mediaApi = {
  create: (body: { invitationId: string; kind: "cover" | "gallery"; mimeType: string; sizeBytes: number; width: number | null; height: number | null; alt?: string }) =>
    apiFetch<{ id: string; path: string; bucket: string }>("/api/media", { method: "POST", json: body }),
  confirm: (id: string) => apiFetch<{ ok: true }>(`/api/media/${id}`, { method: "PATCH", json: { uploaded: true } }),
  update: (id: string, body: { alt?: string; sortOrder?: number; kind?: "cover" | "gallery" }) => apiFetch<{ ok: true }>(`/api/media/${id}`, { method: "PATCH", json: body }),
  remove: (id: string) => apiFetch<{ ok: true }>(`/api/media/${id}`, { method: "DELETE" }),
};

"use client";

import { useMutation } from "@tanstack/react-query";
import { ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/invitations/components/status-badge";
import { apiFetch } from "@/lib/api/client";
import { errorMessage } from "@/features/invitations/hooks";
import { formatShortDate } from "@/lib/utils/dates";
import type { InvitationStatus } from "@/types/domain";
import { cn } from "@/lib/utils/cn";
import { ROUTES, routes } from "@/lib/routes";

interface Row {
  id: string;
  slug: string;
  title: string;
  status: InvitationStatus;
  publishedAt: string | null;
  updatedAt: string;
  ownerName: string;
  ownerId: string;
  templateName: string;
  categoryName: string;
}

export function EventsAdmin({ rows, total, page, pageSize, status }: { rows: Row[]; total: number; page: number; pageSize: number; status?: InvitationStatus }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<Row | null>(null);
  const unpublish = useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/admin/invitations/${id}`, { method: "PATCH", json: { status: "unpublished" } }),
    onSuccess: () => {
      toast.success("Invitation unpublished");
      router.refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => apiFetch<{ ok: true }>(`/api/admin/invitations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Invitation deleted");
      router.refresh();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const href = (p: number, s?: string) => `${ROUTES.adminEvents}?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(p > 1 ? { page: String(p) } : {}) }).toString()}`;
  const chip = (active: boolean) => cn("inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm sm:h-8 sm:px-3", active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground");

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
        <Link href={href(1)} className={chip(!status)}>
          All
        </Link>
        {(["published", "draft", "unpublished"] as const).map((s) => (
          <Link key={s} href={href(1, s)} className={chip(status === s)}>
            {s[0].toUpperCase() + s.slice(1)}
          </Link>
        ))}
      </div>
      <ul className="grid gap-2.5 md:hidden" aria-label="Invitations">
        {rows.map((r) => (
          <li key={r.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium break-words">{r.title || "Untitled"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {r.categoryName} · {r.templateName}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-2 truncate text-xs text-muted-foreground">
              {r.ownerName || "Unknown owner"} · updated {formatShortDate(r.updatedAt, "UTC")} · <code>/e/{r.slug}</code>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {r.status === "published" ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <a href={routes.invitation(r.slug)} target="_blank" rel="noopener noreferrer">
                      <ExternalLinkIcon aria-hidden /> Open
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => unpublish.mutate(r.id)}>
                    Unpublish
                  </Button>
                </>
              ) : null}
              <Button variant="ghost" size="sm" className="ml-auto text-destructive" onClick={() => setConfirm(r)}>
                Delete
              </Button>
            </div>
          </li>
        ))}
        {rows.length === 0 ? <li className="py-10 text-center text-sm text-muted-foreground">No invitations match.</li> : null}
      </ul>
      <div className="relative hidden overflow-x-auto rounded-2xl border border-border bg-surface md:block">
        <table className="w-full text-sm">
          <thead className="bg-subtle text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Invitation</th>
              <th className="px-4 py-3 font-medium">Owner</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{r.title || "Untitled"}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.categoryName} · {r.templateName} · <code>/e/{r.slug}</code>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>{r.ownerName || "—"}</div>
                  <div className="text-xs text-muted-foreground">{r.ownerId.slice(0, 8)}…</div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{formatShortDate(r.updatedAt, "UTC")}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {r.status === "published" ? (
                      <>
                        <Button asChild variant="ghost" size="icon-sm" aria-label="Open">
                          <a href={routes.invitation(r.slug)} target="_blank" rel="noopener noreferrer">
                            <ExternalLinkIcon />
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => unpublish.mutate(r.id)}>
                          Unpublish
                        </Button>
                      </>
                    ) : null}
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirm(r)}>
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No invitations match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <nav className="flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
          {page > 1 ? <Link href={href(page - 1, status)}>Previous</Link> : null}
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? <Link href={href(page + 1, status)}>Next</Link> : null}
        </nav>
      ) : null}

      <AlertDialog open={Boolean(confirm)} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invitation?</AlertDialogTitle>
            <AlertDialogDescription>This removes “{confirm?.title || "Untitled"}”, its photos and RSVP responses for the owner too. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirm && remove.mutate(confirm.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

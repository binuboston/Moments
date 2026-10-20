"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, type SortingState, useReactTable } from "@tanstack/react-table";
import { ArrowUpDownIcon, DownloadIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { invitationKeys, invitationsApi } from "@/features/invitations/api";
import { errorMessage } from "@/features/invitations/hooks";
import type { RsvpItem } from "@/features/invitations/types";
import { formatShortDate } from "@/lib/utils/dates";

const attendanceBadge: Record<RsvpItem["attendance"], { label: string; variant: "success" | "destructive" | "warning" }> = {
  yes: { label: "Attending", variant: "success" },
  no: { label: "Declined", variant: "destructive" },
  maybe: { label: "Maybe", variant: "warning" },
};

export function RsvpManager({ invitationId }: { invitationId: string }) {
  const qc = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }]);
  const { data, isPending, isError, refetch } = useQuery({ queryKey: invitationKeys.rsvps(invitationId), queryFn: () => invitationsApi.rsvps(invitationId) });

  const remove = useMutation({
    mutationFn: (rsvpId: string) => invitationsApi.deleteRsvp(invitationId, rsvpId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: invitationKeys.rsvps(invitationId) });
      toast.success("Response removed");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  const columns: ColumnDef<RsvpItem>[] = [
    { accessorKey: "guestName", header: "Guest", cell: ({ row }) => <span className="font-medium">{row.original.guestName}</span> },
    {
      accessorKey: "attendance",
      header: "Response",
      cell: ({ row }) => {
        const b = attendanceBadge[row.original.attendance];
        return <Badge variant={b.variant}>{b.label}</Badge>;
      },
    },
    { accessorKey: "guestCount", header: "Guests", cell: ({ row }) => <span className="tabular-nums">{row.original.guestCount}</span> },
    { accessorKey: "contact", header: "Contact", cell: ({ row }) => <span className="text-muted-foreground">{row.original.contact ?? "—"}</span> },
    { accessorKey: "dietaryNotes", header: "Dietary", cell: ({ row }) => <span className="text-muted-foreground">{row.original.dietaryNotes ?? "—"}</span> },
    { accessorKey: "message", header: "Message", cell: ({ row }) => <span className="line-clamp-2 max-w-xs text-muted-foreground">{row.original.message ?? "—"}</span> },
    { accessorKey: "updatedAt", header: "Responded", cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatShortDate(row.original.updatedAt, "UTC")}</span> },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-sm" onClick={() => remove.mutate(row.original.id)} aria-label={`Remove response from ${row.original.guestName}`}>
          <Trash2Icon className="text-destructive" />
        </Button>
      ),
      enableSorting: false,
    },
  ];

  const table = useReactTable({ data: data?.items ?? [], columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  if (isError) return <EmptyState title="Couldn't load responses" action={<Button onClick={() => refetch()}>Retry</Button>} />;
  if (isPending) {
    return (
      <div className="grid gap-6" aria-busy>
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const { summary, items } = data;
  const stats = [
    { label: "Responses", value: summary.total },
    { label: "Attending", value: summary.yes },
    { label: "Total guests", value: summary.guests },
    { label: "Declined", value: summary.no },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No responses yet" description="Responses appear here as soon as guests reply on your invitation." />
      ) : (
        <div className="grid gap-3">
          <div className="flex justify-end">
            <Button asChild variant="outline" size="sm">
              <a href={`/api/invitations/${invitationId}/rsvps?format=csv`} download>
                <DownloadIcon aria-hidden /> Export CSV
              </a>
            </Button>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-subtle text-left text-xs text-muted-foreground">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        scope="col"
                        className="px-4 py-3 font-medium whitespace-nowrap"
                        aria-sort={h.column.getCanSort() ? (h.column.getIsSorted() === "asc" ? "ascending" : h.column.getIsSorted() === "desc" ? "descending" : "none") : undefined}
                      >
                        {h.column.getCanSort() ? (
                          <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={h.column.getToggleSortingHandler()}>
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            <ArrowUpDownIcon className="size-3" aria-hidden />
                          </button>
                        ) : (
                          flexRender(h.column.columnDef.header, h.getContext())
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-border">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-top">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

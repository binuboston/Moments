"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyInvitations } from "@/features/dashboard/empty-invitations";
import { Skeleton } from "@/components/ui/skeleton";
import { InvitationGrid } from "@/features/invitations/components/invitation-grid";
import { useInvitationList } from "@/features/invitations/hooks";
import type { InvitationListResponse } from "@/features/invitations/types";
import { cn } from "@/lib/utils/cn";

type Status = "all" | "draft" | "published" | "unpublished";

interface Props {
  initialParams: { status: Status; page: number; pageSize: number };
  initialData: InvitationListResponse;
}

export function InvitationList({ initialParams, initialData }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = (searchParams.get("status") as Status | null) ?? initialParams.status;
  const page = Number(searchParams.get("page") ?? initialParams.page) || 1;
  const params = { status, page, pageSize: initialParams.pageSize };
  const isInitial = status === initialParams.status && page === initialParams.page;

  const { data, isFetching, isError, refetch } = useInvitationList(params, isInitial ? initialData : undefined);

  const setStatus = (next: Status) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (next === "all") sp.delete("status");
    else sp.set("status", next);
    sp.delete("page");
    router.replace(`${pathname}?${sp.toString()}`);
  };

  const setPage = (next: number) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (next <= 1) sp.delete("page");
    else sp.set("page", String(next));
    router.replace(`${pathname}?${sp.toString()}`);
  };

  const counts = data?.counts ?? initialData.counts;
  const tabs: { value: Status; label: string; count: number }[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "draft", label: "Drafts", count: counts.draft },
    { value: "published", label: "Published", count: counts.published },
    { value: "unpublished", label: "Unpublished", count: counts.unpublished },
  ];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Filter by status" className="surface-card flex min-w-0 gap-1 overflow-x-auto rounded-full p-1 no-scrollbar sm:w-fit">
          {tabs.map((t) => (
            <button
              key={t.value}
              role="tab"
              type="button"
              aria-selected={status === t.value}
              onClick={() => setStatus(t.value)}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors duration-(--duration-base) sm:h-9",
                status === t.value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-fill hover:text-foreground",
              )}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", status === t.value ? "bg-background/20" : "bg-fill")}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <EmptyState title="Couldn't load your invitations" description="Please check your connection and try again." action={<Button onClick={() => refetch()}>Retry</Button>} />
      ) : !data ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3" aria-busy>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-96 w-full rounded-card" />
            </li>
          ))}
        </ul>
      ) : data.items.length === 0 ? (
        counts.all === 0 ? (
          <EmptyInvitations />
        ) : (
          <EmptyState title="Nothing here yet" description="No invitations with this status. Try another filter." />
        )
      ) : (
        <>
          <InvitationGrid items={data.items} busy={isFetching} />
          {totalPages > 1 ? (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}

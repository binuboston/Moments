"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyInvitations } from "@/features/dashboard/empty-invitations";
import { Skeleton } from "@/components/ui/skeleton";
import { InvitationGrid } from "@/features/invitations/components/invitation-grid";
import { useInvitationList } from "@/features/invitations/hooks";
import { StatusDot } from "@/features/invitations/components/status-badge";
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
      {/* Filters as chips; the status dots double as the legend for the dots on each pin. */}
      <div role="tablist" aria-label="Filter by status" className="-mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:px-0">
        {tabs.map((t) => {
          const active = status === t.value;
          return (
            <button
              key={t.value}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => setStatus(t.value)}
              data-testid={`filter-${t.value}`}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-[background-color,color,transform] duration-(--duration-base) active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                active ? "bg-foreground text-background" : "bg-fill text-foreground hover:bg-fill-hover",
              )}
            >
              {t.value !== "all" ? <StatusDot status={t.value} className={cn(active && "ring-2 ring-background/30")} /> : null}
              {t.label}
              <span className={cn("text-xs font-medium tabular-nums", active ? "text-background/70" : "text-muted-foreground")}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {isError ? (
        <EmptyState title="Couldn't load your invitations" description="Please check your connection and try again." action={<Button onClick={() => refetch()}>Retry</Button>} />
      ) : !data ? (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4" aria-busy>
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="aspect-[1200/630] w-full rounded-2xl" />
              <Skeleton className="mt-3 h-3.5 w-3/4 rounded-full" />
              <Skeleton className="mt-2 h-3 w-1/2 rounded-full" />
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
          <InvitationGrid items={data.items} busy={isFetching} createTile={page === 1 && status !== "published" && status !== "unpublished"} />
          {totalPages > 1 ? (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
              <Button variant="soft" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="soft" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}

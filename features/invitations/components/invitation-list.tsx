"use client";

import { MailIcon, PlusIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { InvitationGrid } from "@/features/invitations/components/invitation-grid";
import { useInvitationList } from "@/features/invitations/hooks";
import type { InvitationListResponse } from "@/features/invitations/types";
import { cn } from "@/lib/utils/cn";

type Status = "all" | "draft" | "published" | "unpublished";

interface Props {
  initialParams: { status: Status; q: string; page: number; pageSize: number };
  initialData: InvitationListResponse;
}

export function InvitationList({ initialParams, initialData }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialParams.q);

  const status = (searchParams.get("status") as Status | null) ?? initialParams.status;
  const page = Number(searchParams.get("page") ?? initialParams.page) || 1;
  const activeQ = searchParams.get("q") ?? initialParams.q;
  const params = { status, q: activeQ, page, pageSize: initialParams.pageSize };
  const isInitial = status === initialParams.status && activeQ === initialParams.q && page === initialParams.page;

  const { data, isFetching, isError, refetch } = useInvitationList(params, isInitial ? initialData : undefined);

  // Debounced search → URL (so the list is shareable and survives refresh).
  useEffect(() => {
    if (q === activeQ) return;
    const t = setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());
      if (q) sp.set("q", q);
      else sp.delete("q");
      sp.delete("page");
      router.replace(`${pathname}?${sp.toString()}`);
    }, 350);
    return () => clearTimeout(t);
  }, [q, activeQ, pathname, router, searchParams]);

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
        {/* Phones: search first, then status chips that scroll edge to edge. */}
        <div className="relative order-first sm:order-last sm:w-64">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title" className="pl-9" aria-label="Search invitations" />
        </div>
        <div role="tablist" aria-label="Filter by status" className="-mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 no-scrollbar sm:mx-0 sm:gap-1 sm:rounded-xl sm:bg-muted sm:p-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              role="tab"
              type="button"
              aria-selected={status === t.value}
              onClick={() => setStatus(t.value)}
              className={cn(
                "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors sm:h-8 sm:rounded-lg sm:border-0 sm:px-3",
                status === t.value
                  ? "border-foreground bg-foreground text-background sm:bg-surface sm:text-foreground sm:shadow-soft"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground sm:bg-transparent",
              )}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", status === t.value ? "bg-background/20 sm:bg-border/70" : "bg-border/70")}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {isError ? (
        <EmptyState title="Couldn't load your invitations" description="Please check your connection and try again." action={<Button onClick={() => refetch()}>Retry</Button>} />
      ) : !data ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3" aria-busy>
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-56 w-full rounded-2xl" />
            </li>
          ))}
        </ul>
      ) : data.items.length === 0 ? (
        counts.all === 0 ? (
          <EmptyState
            icon={MailIcon}
            title="No invitations yet"
            description="Start with a template and have a beautiful invitation ready to share in minutes."
            action={
              <Button asChild>
                <Link href="/dashboard/invitations/new">
                  <PlusIcon aria-hidden /> Create your first invitation
                </Link>
              </Button>
            }
          />
        ) : (
          <EmptyState title="Nothing matches" description="Try a different status or search term." />
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

import { Skeleton } from "@/components/ui/skeleton";

export default function InvitationsLoading() {
  return (
    <div className="grid gap-8" aria-busy aria-label="Loading">
      <div className="flex items-end justify-between">
        <div className="grid gap-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <Skeleton className="h-11 w-full max-w-md rounded-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-96 rounded-card" />
        ))}
      </div>
    </div>
  );
}

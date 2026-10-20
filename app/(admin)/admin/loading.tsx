import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="grid gap-8" aria-busy aria-label="Loading">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

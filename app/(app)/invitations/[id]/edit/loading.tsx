import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the editor: floating toolbar, title, then collapsed section cards. */
export default function EditorLoading() {
  return (
    <div className="grid gap-4" aria-busy aria-label="Loading editor">
      <Skeleton className="h-14 w-full rounded-2xl" />
      <div className="mx-auto grid w-full max-w-3xl gap-4">
        <div className="grid gap-2 px-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-96 rounded-card" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-card" />
        ))}
      </div>
    </div>
  );
}

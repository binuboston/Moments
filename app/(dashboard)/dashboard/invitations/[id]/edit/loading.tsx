import { Skeleton } from "@/components/ui/skeleton";

export default function EditorLoading() {
  return (
    <div className="-mx-4 -my-8 grid min-h-[calc(100vh-4rem)] sm:-mx-6 lg:-mx-10 lg:grid-cols-[14rem_minmax(0,1fr)_minmax(22rem,30rem)]" aria-busy aria-label="Loading editor">
      <div className="border-b border-border p-3 lg:border-r lg:border-b-0">
        <div className="flex gap-2 lg:flex-col">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-28 lg:w-full" />
          ))}
        </div>
      </div>
      <div className="px-6 py-8">
        <div className="mx-auto grid max-w-2xl gap-5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      </div>
      <div className="hidden border-l border-border p-6 lg:block">
        <Skeleton className="mx-auto aspect-[9/19] w-full max-w-[21rem] rounded-[2.75rem]" />
      </div>
    </div>
  );
}

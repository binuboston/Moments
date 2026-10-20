import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors home: chips, a heading, then a masonry of pins. */
export default function HomeLoading() {
  const heights = ["h-72", "h-56", "h-80", "h-64", "h-48", "h-72", "h-60", "h-80", "h-52", "h-64"];
  return (
    <div className="grid gap-8 px-4 pt-2 pb-10 sm:px-6" aria-busy aria-label="Loading">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-32 shrink-0 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-9 w-72" />
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5 [&>*]:mb-5">
        {heights.map((h, i) => (
          <Skeleton key={i} className={`${h} w-full rounded-2xl`} />
        ))}
      </div>
    </div>
  );
}

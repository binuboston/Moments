import Link from "next/link";
import type { EventCategory } from "@/types/domain";
import { categoryStyle, TONES } from "@/lib/design/tones";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

/** A row of occasion chips (scrolls sideways on phones), like a feed's topic chips. */
export function OccasionChips({ categories, className }: { categories: EventCategory[]; className?: string }) {
  return (
    <nav aria-label="Occasions" className={cn("-mx-4 flex gap-2 overflow-x-auto px-4 no-scrollbar sm:-mx-6 sm:px-6", className)}>
      {categories.map((c) => {
        const style = categoryStyle(c.slug);
        return (
          <Link
            key={c.id}
            href={routes.templatesFor(c.slug)}
            className={cn("inline-flex h-12 shrink-0 items-center gap-2 rounded-2xl pr-4 pl-3 text-sm font-semibold transition-[filter] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", TONES[style.tone])}
          >
            <style.icon className="size-5" aria-hidden />
            <span className="text-foreground">{c.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

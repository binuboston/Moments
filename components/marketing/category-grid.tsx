import * as Icons from "lucide-react";
import Link from "next/link";
import type { EventCategory } from "@/types/domain";
import { cn } from "@/lib/utils/cn";
import { routes } from "@/lib/routes";

const FALLBACK_ICON = Icons.Sparkles;

export function categoryIcon(name: string | null): Icons.LucideIcon {
  if (!name) return FALLBACK_ICON;
  const icon = (Icons as unknown as Record<string, Icons.LucideIcon | undefined>)[name];
  return typeof icon === "function" || (typeof icon === "object" && icon !== null) ? icon : FALLBACK_ICON;
}

export function CategoryGrid({ categories, className, active }: { categories: EventCategory[]; className?: string; active?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}>
      {categories.map((cat) => {
        const Icon = categoryIcon(cat.icon);
        const isActive = active === cat.slug;
        return (
          <li key={cat.id} data-reveal>
            <Link
              href={routes.templatesFor(cat.slug)}
              className={cn(
                "group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-[transform,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft focus-visible:ring-2 focus-visible:ring-ring",
                isActive && "border-primary ring-1 ring-primary",
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="font-medium">{cat.name}</span>
              {cat.description ? <span className="text-xs leading-relaxed text-muted-foreground">{cat.description}</span> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

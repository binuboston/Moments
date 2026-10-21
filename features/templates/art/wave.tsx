import { cn } from "@/lib/utils/cn";

/** Soft wavy edge, filled with the current colour (use it to blend a tinted band into the page). */
export function Wave({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" className={cn("block h-8 w-full sm:h-12", className)} aria-hidden>
      <path d="M0 22 C 50 2, 100 2, 150 18 C 200 34, 250 36, 300 20 C 340 8, 370 8, 400 16 L400 40 L0 40Z" fill="currentColor" />
    </svg>
  );
}

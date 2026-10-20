import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { TONES, type Tone } from "@/lib/design/tones";

const SIZES = {
  sm: "size-9 [&>svg]:size-4",
  md: "size-11 [&>svg]:size-5",
  lg: "size-14 [&>svg]:size-6",
} as const;

/** Pastel rounded tile holding an icon: the identity mark for a category, stat or feature. */
export function IconTile({ icon: Icon, tone = "slate", size = "md", className }: { icon: LucideIcon; tone?: Tone; size?: keyof typeof SIZES; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center rounded-tile", TONES[tone], SIZES[size], className)} aria-hidden>
      <Icon />
    </span>
  );
}

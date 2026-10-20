import Link from "next/link";
import { wordmarkFont } from "@/lib/fonts";
import { BRAND } from "@/lib/brand";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

/** The "Invite" wordmark, set in Pacifico. Links home. */
export function Logo({ className, href = ROUTES.home }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center rounded-md px-0.5 text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} aria-label={`${BRAND.name} home`}>
      <span className={cn(wordmarkFont.className, "text-2xl leading-none sm:text-[1.7rem]")} aria-hidden>
        {BRAND.name}
      </span>
    </Link>
  );
}

/** Compact mark for the side rail: the wordmark's initial on a brand-red disc. */
export function LogoMark({ className, href = ROUTES.home }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("flex size-12 items-center justify-center rounded-full outline-none transition-colors hover:bg-fill focus-visible:ring-2 focus-visible:ring-ring", className)}
      aria-label={`${BRAND.name} home`}
    >
      <span className={cn(wordmarkFont.className, "flex size-9 items-center justify-center rounded-full bg-primary pb-1 text-xl leading-none text-primary-foreground")} aria-hidden>
        {BRAND.name[0]}
      </span>
    </Link>
  );
}

import Link from "next/link";
import { wordmarkFont } from "@/lib/fonts";
import { cn } from "@/lib/utils/cn";

/** The "Invite" wordmark, set in Pacifico. Always links to the landing page. */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center rounded-md px-0.5 text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      aria-label="Invite home"
    >
      <span className={cn(wordmarkFont.className, "text-2xl leading-none sm:text-[1.7rem]")} aria-hidden>
        Invite
      </span>
    </Link>
  );
}

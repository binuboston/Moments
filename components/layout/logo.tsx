import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden focusable="false">
      <rect x="2" y="6" width="28" height="22" rx="4" className="fill-primary" />
      <path d="M4 10l12 9 12-9" className="stroke-primary-foreground" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="25" cy="7" r="4" className="fill-accent" />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} aria-label="Mirth home">
      <LogoMark />
      <span className="font-display text-xl font-semibold tracking-tight">Mirth</span>
    </Link>
  );
}

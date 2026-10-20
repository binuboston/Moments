import { GiftIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { InvitationContent } from "@/lib/validation/content";

export function Gifts({ gifts, className }: { gifts: InvitationContent["gifts"]; className?: string }) {
  if (!gifts.note && !gifts.url) return null;
  return (
    <div className={cn("mx-auto max-w-md", className)} data-inv-reveal>
      <GiftIcon className="mx-auto mb-4 size-6 text-(--inv-accent)" aria-hidden />
      {gifts.note ? <p className="leading-relaxed text-pretty">{gifts.note}</p> : null}
      {gifts.url ? (
        <a
          href={gifts.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center rounded-full bg-(--inv-accent) px-5 py-2 text-sm font-medium text-(--inv-accent-contrast) hover:brightness-95"
        >
          View registry
        </a>
      ) : null}
    </div>
  );
}

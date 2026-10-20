import { MailIcon, PhoneIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { InvitationContent } from "@/lib/validation/content";

export function Contacts({ contacts, className }: { contacts: InvitationContent["contacts"]; className?: string }) {
  if (contacts.length === 0) return null;
  return (
    <ul className={cn("mx-auto grid max-w-2xl gap-4 sm:grid-cols-2", className)} data-inv-reveal="stagger">
      {contacts.map((c, i) => (
        <li key={`${c.name}-${i}`} className="rounded-2xl border border-(--inv-border) bg-(--inv-surface) p-5 text-left">
          <p className="font-medium">{c.name}</p>
          <div className="mt-2 flex flex-col gap-1 text-sm text-(--inv-muted)">
            {c.phone ? (
              <a href={`tel:${c.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 hover:text-(--inv-accent)">
                <PhoneIcon className="size-3.5" aria-hidden /> {c.phone}
              </a>
            ) : null}
            {c.email ? (
              <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 hover:text-(--inv-accent)">
                <MailIcon className="size-3.5" aria-hidden /> {c.email}
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

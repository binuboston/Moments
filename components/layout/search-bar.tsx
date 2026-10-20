"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAccount } from "@/features/auth/account-context";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

/**
 * The big search pill in the top bar. People with a session search their own
 * invitations; signed-out visitors search the template catalogue (no guest
 * session needed just to look around).
 */
export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const account = useAccount();
  const onSearchPage = pathname === ROUTES.invitations || pathname === ROUTES.templates;
  const [q, setQ] = useState(onSearchPage ? (searchParams.get("q") ?? "") : "");
  const target = account ? ROUTES.invitations : ROUTES.templates;
  const placeholder = account ? "Search your invitations" : "Search designs";

  const submit = (value: string) => {
    const sp = new URLSearchParams();
    if (value.trim()) sp.set("q", value.trim());
    const qs = sp.toString();
    router.push(qs ? `${target}?${qs}` : target);
  };

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        submit(q);
      }}
    >
      <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-12 w-full rounded-full bg-fill pr-11 pl-12 text-base text-foreground outline-none transition-[background-color,box-shadow] placeholder:text-muted-foreground hover:bg-fill-hover focus:bg-surface focus:ring-4 focus:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
        data-testid="search"
      />
      {q ? (
        <button
          type="button"
          onClick={() => {
            setQ("");
            if (onSearchPage) submit("");
          }}
          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-fill-hover hover:text-foreground"
          aria-label="Clear search"
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
    </form>
  );
}

"use client";

import { ArrowRightIcon, ClockIcon, CornerDownLeftIcon, Loader2Icon, SearchIcon, XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useAccount } from "@/features/auth/account-context";
import { useRecentSearches } from "@/features/search/client/recent";
import { useSearch } from "@/features/search/client/use-search";
import { ResultRow } from "@/features/search/components/result-row";
import type { SearchIconKey } from "@/features/search/types";
import { isAppPath, ROUTES, routes } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

/** A row in the listbox: a result, a recent search, a suggestion or "See all results". */
interface Option {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  icon: SearchIconKey | "recent" | "all";
  /** Navigate here, or fill the box with `fill` (recent searches). */
  href?: string;
  fill?: string;
}

const SUGGESTIONS: Option[] = [
  { id: "s-create", group: "Suggestions", title: "Create an invitation", icon: "plus", href: ROUTES.newInvitation },
  { id: "s-templates", group: "Suggestions", title: "Browse templates", icon: "layout", href: ROUTES.templates },
  { id: "s-help", group: "Suggestions", title: "Help centre", icon: "help", href: ROUTES.help },
];

const isTyping = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

/**
 * The search box, its listbox and keyboard model (WAI-ARIA combobox): arrows
 * move, Enter opens (or shows all results), Escape clears then closes. Shared
 * by the inline (desktop dropdown) and sheet (phone full screen) variants.
 */
function SearchBox({ variant, onDone, inputRef }: { variant: "inline" | "sheet"; onDone: () => void; inputRef: React.RefObject<HTMLInputElement | null> }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const account = useAccount();
  const recents = useRecentSearches();
  const [q, setQ] = useState(pathname === ROUTES.search ? (searchParams.get("q") ?? "") : "");
  const [open, setOpen] = useState(variant === "sheet");
  const [active, setActive] = useState(-1);
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const search = useSearch(q);
  const term = q.trim();

  const options: Option[] = term
    ? [
        ...(search.data?.groups ?? []).flatMap((g) => g.results.map((r) => ({ id: r.id, group: g.label, title: r.title, subtitle: r.subtitle, icon: r.icon, href: r.href }))),
        { id: "all", group: "", title: `See all results for “${term}”`, icon: "all" as const, href: routes.search(term) },
      ]
    : [...recents.list.map((r) => ({ id: `recent:${r}`, group: "Recent searches", title: r, icon: "recent" as const, fill: r })), ...SUGGESTIONS];
  const optionId = (i: number) => `${listId}-${i}`;
  const resultCount = options.filter((o) => o.icon !== "all").length;

  const go = (href: string) => {
    if (term) recents.add(term);
    setOpen(variant === "sheet");
    setActive(-1);
    onDone();
    // Signed-out visitors heading to an app page start a guest session first (as AppLink does).
    if (account === null && isAppPath(href)) window.location.assign(routes.start(href));
    else router.push(href);
  };

  const choose = (o: Option) => {
    if (o.fill !== undefined) {
      setQ(o.fill);
      setActive(-1);
      inputRef.current?.focus();
    } else if (o.href) go(o.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const n = options.length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      if (n) setActive((i) => (e.key === "ArrowDown" ? (i + 1) % n : (i - 1 + n) % n));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && options[active]) choose(options[active]);
      else if (term) go(routes.search(term));
    } else if (e.key === "Escape") {
      e.preventDefault();
      if (q) {
        setQ("");
        setActive(-1);
      } else {
        setOpen(variant === "sheet");
        onDone();
      }
    } else if (e.key === "Tab") {
      setOpen(variant === "sheet");
    }
  };

  // Keep the highlighted option in view (DOM only).
  useEffect(() => {
    if (active >= 0) listRef.current?.querySelector(`[id="${optionId(active)}"]`)?.scrollIntoView({ block: "nearest" });
  });

  const expanded = open && options.length > 0;
  // Consecutive options with the same heading form one labelled group.
  const sections: { label: string; items: { option: Option; index: number }[] }[] = [];
  options.forEach((option, index) => {
    const last = sections.at(-1);
    if (last && last.label === option.group) last.items.push({ option, index });
    else sections.push({ label: option.group, items: [{ option, index }] });
  });

  const renderOption = (o: Option, i: number) => (
    <div
      key={o.id}
      id={optionId(i)}
      role="option"
      aria-selected={i === active}
      onMouseMove={() => i !== active && setActive(i)}
      onClick={() => choose(o)}
      data-testid={`search-option-${o.id}`}
      className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2", i === active ? "bg-fill" : "hover:bg-fill/60", o.icon === "all" && "mt-1 border-t border-border pt-3")}
    >
      {o.icon === "recent" ? (
        <>
          <span className="grid size-9 shrink-0 place-items-center rounded-tile bg-fill text-muted-foreground" aria-hidden>
            <ClockIcon className="size-4" />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm">{o.title}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              recents.remove(o.title);
            }}
            className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-fill-hover hover:text-foreground"
            aria-label={`Remove “${o.title}” from recent searches`}
            tabIndex={-1}
          >
            <XIcon className="size-3.5" />
          </button>
        </>
      ) : o.icon === "all" ? (
        <span className="flex flex-1 items-center justify-between gap-3 text-sm font-semibold">
          {o.title}
          <ArrowRightIcon className="size-4 text-muted-foreground" aria-hidden />
        </span>
      ) : (
        <ResultRow icon={o.icon} title={o.title} subtitle={o.subtitle} query={term} className="flex-1" />
      )}
    </div>
  );

  const list = (
    <div className={cn("overflow-y-auto overscroll-contain p-2", variant === "inline" ? "max-h-[min(70vh,34rem)]" : "flex-1")}>
      {term && !search.pending && resultCount === 0 ? (
        <p className="px-3 pt-3 pb-2 text-sm text-muted-foreground">No matches for “{term}”. Try an occasion, a template name or a guest&apos;s name.</p>
      ) : null}
      <div
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label="Search results"
        // Keep focus in the box while clicking an option.
        onMouseDown={(e) => e.preventDefault()}
      >
        {sections.map((section, si) =>
          section.label ? (
            <div key={`${section.label}-${si}`} role="group" aria-labelledby={`${listId}-g${si}`}>
              <div id={`${listId}-g${si}`} className="px-3 pt-3 pb-1.5 text-xs font-semibold text-muted-foreground">
                {section.label}
              </div>
              {section.items.map(({ option, index }) => renderOption(option, index))}
            </div>
          ) : (
            section.items.map(({ option, index }) => renderOption(option, index))
          ),
        )}
      </div>
    </div>
  );

  const placeholder = account ? "Search invitations, guests, templates and help" : "Search templates, occasions and help";

  return (
    <div
      className={cn("relative", variant === "sheet" && "flex h-full flex-col")}
      onBlur={(e) => {
        if (variant === "inline" && !e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <div className={cn("relative", variant === "sheet" && "flex items-center gap-2 border-b border-border p-3")}>
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={expanded}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={expanded && active >= 0 ? optionId(active) : undefined}
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="h-12 w-full rounded-full bg-fill pr-20 pl-12 text-base text-foreground outline-none transition-[background-color,box-shadow] placeholder:text-muted-foreground hover:bg-fill-hover focus:bg-surface focus:ring-4 focus:ring-ring/30"
            data-testid={variant === "inline" ? "search" : "search-sheet-input"}
          />
          <span className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
            {term && search.pending ? <Loader2Icon className="size-4 animate-spin text-muted-foreground" aria-hidden /> : null}
            {q ? (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setActive(-1);
                  inputRef.current?.focus();
                }}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-fill-hover hover:text-foreground"
                aria-label="Clear search"
              >
                <XIcon className="size-4" />
              </button>
            ) : variant === "inline" ? (
              <kbd className="mr-2 hidden rounded-md border border-border px-1.5 py-0.5 font-sans text-[0.7rem] text-muted-foreground lg:block" aria-hidden>
                ⌘K
              </kbd>
            ) : null}
          </span>
        </div>
        {variant === "sheet" ? (
          <DialogPrimitive.Close className="rounded-full px-3 py-2 text-sm font-semibold hover:bg-fill">Cancel</DialogPrimitive.Close>
        ) : null}
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic>
        {term && !search.pending ? (resultCount ? `${resultCount} results` : "No results") : ""}
      </p>

      {variant === "inline" ? (
        expanded ? (
          <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-surface shadow-float ring-1 ring-black/5 animate-fade-in" data-testid="search-panel">
            {list}
            <div className="hidden items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground sm:flex" aria-hidden>
              <span>↑↓ to move</span>
              <span className="inline-flex items-center gap-1">
                <CornerDownLeftIcon className="size-3" /> to open
              </span>
              <span>esc to close</span>
            </div>
          </div>
        ) : null
      ) : (
        list
      )}
    </div>
  );
}

/**
 * The one search in the product, in the top bar. "inline": a search field
 * with a results dropdown (tablet and desktop). "sheet": a search-looking
 * button that opens full-screen search (phones). ⌘K, Ctrl+K or "/" focuses
 * whichever is on screen.
 */
export function GlobalSearch({ variant, className }: { variant: "inline" | "sheet"; className?: string }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const shortcut = ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !isTyping(e.target));
      if (!shortcut) return;
      const target = variant === "inline" ? inputRef.current : triggerRef.current;
      // Only the variant that is visible responds (the other is display:none).
      if (!target || target.offsetParent === null) return;
      e.preventDefault();
      if (variant === "inline") inputRef.current?.focus();
      else setSheetOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  if (variant === "inline") {
    return (
      <div role="search" className={className}>
        <SearchBox variant="inline" inputRef={inputRef} onDone={() => inputRef.current?.blur()} />
      </div>
    );
  }

  return (
    <div role="search" className={className}>
      <DialogPrimitive.Root open={sheetOpen} onOpenChange={setSheetOpen}>
        <DialogPrimitive.Trigger
          ref={triggerRef}
          className="flex h-10 w-full min-w-0 items-center gap-2 rounded-full bg-fill px-3.5 text-left text-sm text-muted-foreground transition-colors hover:bg-fill-hover focus-visible:ring-4 focus-visible:ring-ring/30 focus-visible:outline-none"
          data-testid="search-trigger"
        >
          <SearchIcon className="size-4 shrink-0" aria-hidden />
          Search
        </DialogPrimitive.Trigger>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Content className="fixed inset-0 z-[90] flex flex-col bg-surface outline-none data-[state=open]:animate-fade-in" aria-describedby={undefined} onOpenAutoFocus={(e) => (e.preventDefault(), inputRef.current?.focus())}>
            <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
            <SearchBox variant="sheet" inputRef={inputRef} onDone={() => setSheetOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

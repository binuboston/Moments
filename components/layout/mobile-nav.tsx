"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { MenuIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { AccountAvatar } from "@/components/layout/account-avatar";
import { AppLink } from "@/components/layout/app-link";
import { useSignOut } from "@/features/auth/use-sign-out";
import { accountView, type AccountAction } from "@/lib/auth/account-actions";
import type { Account } from "@/lib/auth/account";
import { isActivePath, PRIMARY_NAV } from "@/lib/routes";
import { cn } from "@/lib/utils/cn";

/** Phone menu: the same navigation as the desktop header, plus account entry points. */
export function MobileNav({ account }: { account: Account | null | undefined }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => setOpen(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="soft" size="icon-sm" className="md:hidden" aria-label="Open menu">
          <MenuIcon className="size-5" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out md:hidden" />
        <DialogPrimitive.Content className="surface-card fixed inset-x-3 top-3 z-50 p-4 outline-none data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out md:hidden">
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <div className="flex h-12 items-center justify-between">
            <Logo />
            <DialogPrimitive.Close asChild>
              <Button variant="soft" size="icon-sm" aria-label="Close menu">
                <XIcon className="size-5" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <nav aria-label="Primary mobile" className="mt-3 grid gap-1">
            {PRIMARY_NAV.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <AppLink
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={cn("rounded-2xl px-4 py-3 text-base font-medium transition-colors", active ? "bg-fill text-foreground" : "text-muted-foreground hover:bg-fill hover:text-foreground")}
                >
                  {item.label}
                </AppLink>
              );
            })}
          </nav>
          <div className="mt-3 border-t border-border pt-3">
            <AccountSection account={account} onNavigate={close} />
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** The account part of the phone menu. Renders the shared account model (lib/auth/account-actions). */
function AccountSection({ account, onNavigate }: { account: Account | null | undefined; onNavigate: () => void }) {
  const { signOut } = useSignOut();
  if (account === undefined) return null;
  const view = accountView(account);

  const button = (a: AccountAction, primary = false) =>
    a.href ? (
      <Button key={a.key} asChild size={primary ? "lg" : "md"} variant={primary ? "primary" : "soft"} onClick={onNavigate} data-testid={`mobile-account-${a.key}`}>
        <AppLink href={a.href}>
          <a.icon aria-hidden /> {a.label}
        </AppLink>
      </Button>
    ) : (
      <Button
        key={a.key}
        variant="soft"
        onClick={() => {
          onNavigate();
          void signOut();
        }}
        data-testid={`mobile-account-${a.key}`}
      >
        <a.icon aria-hidden /> {a.label}
      </Button>
    );

  return (
    <div className="grid gap-2" data-testid={account ? (account.isGuest ? "mobile-guest" : "mobile-account") : "mobile-signed-out"}>
      {view.identity ? (
        <div className="flex items-center gap-3 rounded-2xl bg-fill px-3 py-2.5">
          <AccountAvatar identity={view.identity} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{view.identity.title}</p>
            <p className="truncate text-xs text-muted-foreground">{view.identity.subtitle}</p>
          </div>
        </div>
      ) : null}
      {view.primary ? button(view.primary, true) : null}
      <div className="grid grid-cols-2 gap-2">{view.actions.map((a) => button(a))}</div>
    </div>
  );
}

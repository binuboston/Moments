"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { AccountAvatar } from "@/components/layout/account-avatar";
import { AppLink } from "@/components/layout/app-link";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { useSignOut } from "@/features/auth/use-sign-out";
import { accountView, type AccountAction } from "@/lib/auth/account-actions";
import type { Account } from "@/lib/auth/account";
import { SUPPORT_NAV } from "@/lib/routes";

/** Phone "Menu" tab: the account (the top bar has no account menu on phones), appearance, and Settings & support pages, in a sheet. */
export function MobileNav({ account, trigger }: { account: Account | null | undefined; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out md:hidden" />
        <DialogPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-float outline-none data-[state=open]:animate-sheet-up data-[state=closed]:animate-sheet-down md:hidden">
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <div className="mb-3 flex h-12 items-center justify-between">
            <Logo />
            <DialogPrimitive.Close asChild>
              <Button variant="soft" size="icon-sm" aria-label="Close menu">
                <XIcon className="size-5" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <AccountSection account={account} onNavigate={close} />
          <section aria-labelledby="menu-appearance" className="mt-4 grid gap-2 border-t border-border pt-4">
            <h2 id="menu-appearance" className="px-1 text-xs font-medium text-muted-foreground">
              Appearance
            </h2>
            <ThemeSwitcher />
          </section>
          <nav aria-label="Settings and support" className="mt-4 grid gap-1 border-t border-border pt-3">
            {SUPPORT_NAV.map((item) => (
              <AppLink key={item.href} href={item.href} onClick={close} className="rounded-2xl px-4 py-3 text-base font-semibold hover:bg-fill">
                {item.label}
              </AppLink>
            ))}
          </nav>
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

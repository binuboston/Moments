"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import type { Account } from "@/lib/auth/account";
import { isActivePath, PRIMARY_NAV, ROUTES } from "@/lib/routes";
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
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={cn("rounded-2xl px-4 py-3 text-base font-medium transition-colors", active ? "bg-fill text-foreground" : "text-muted-foreground hover:bg-fill hover:text-foreground")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {account === null || account?.isGuest ? (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
              <Button asChild variant="soft" onClick={close}>
                <Link href={ROUTES.login}>Log in</Link>
              </Button>
              <Button asChild onClick={close}>
                <Link href={ROUTES.signup}>Sign up</Link>
              </Button>
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

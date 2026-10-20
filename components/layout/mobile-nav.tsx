"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

interface MobileNavProps {
  isAuthenticated: boolean;
  items: ReadonlyArray<{ href: string; label: string }>;
}

export function MobileNav({ isAuthenticated, items }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <MenuIcon className="size-5" />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in md:hidden" />
        <DialogPrimitive.Content className="fixed inset-x-0 top-0 z-50 rounded-b-3xl border-b border-border bg-background p-4 shadow-lift outline-none data-[state=open]:animate-fade-up md:hidden">
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <div className="flex h-12 items-center justify-between">
            <Logo />
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close menu">
                <XIcon className="size-5" />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <nav aria-label="Primary mobile" className="mt-4 flex flex-col gap-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-2 border-t border-border pt-4">
            {isAuthenticated ? (
              <Button asChild size="lg" onClick={() => setOpen(false)}>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" onClick={() => setOpen(false)}>
                  <Link href="/signup">Create an invitation</Link>
                </Button>
                <Button asChild size="lg" variant="outline" onClick={() => setOpen(false)}>
                  <Link href="/login">Log in</Link>
                </Button>
              </>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

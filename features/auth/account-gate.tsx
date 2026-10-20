"use client";

import { HeartIcon } from "lucide-react";
import { useState } from "react";
import { SwapTransition } from "@/components/motion/swap-transition";
import { IconTile } from "@/components/ui/icon-tile";
import { LoginForm, SignupForm } from "@/features/auth/auth-forms";
import { cn } from "@/lib/utils/cn";

/**
 * Shown to guests at the moment it matters (publishing): create an account or
 * log in without leaving the page. Their draft moves to the account; `next`
 * is where Google sign-in returns to.
 */
export function AccountGate({ next, onSuccess, title = "Create your free account to publish" }: { next: string; onSuccess: () => void; title?: string }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");

  return (
    <div className="grid gap-5" data-testid="account-gate">
      <div className="flex items-start gap-3 rounded-2xl bg-tone-rose p-4">
        <IconTile icon={HeartIcon} tone="rose" size="sm" className="bg-surface" />
        <div>
          <p className="font-semibold text-tone-rose-ink">{title}</p>
          <p className="mt-0.5 text-sm text-tone-rose-ink/80">Your design and details are saved and move to your account. It takes a few seconds.</p>
        </div>
      </div>

      <div role="tablist" aria-label="Account" className="relative grid h-10 grid-cols-2 rounded-full bg-fill p-1 text-sm font-medium">
        <span
          aria-hidden
          className={cn("absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-surface shadow-card transition-transform duration-(--duration-slow) ease-(--ease-out-quart) motion-reduce:transition-none", mode === "login" && "translate-x-full")}
        />
        {(["signup", "login"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            data-testid={`gate-${m}`}
            className={cn("relative z-10 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring", mode === m ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {m === "signup" ? "Create account" : "I have an account"}
          </button>
        ))}
      </div>

      <SwapTransition swapKey={mode}>
        {mode === "signup" ? <SignupForm embedded next={next} onSuccess={onSuccess} /> : <LoginForm embedded next={next} onSuccess={onSuccess} />}
      </SwapTransition>
    </div>
  );
}

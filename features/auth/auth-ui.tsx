"use client";

import { EyeIcon, EyeOffIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

export const googleEnabled = () => publicEnv().NEXT_PUBLIC_AUTH_GOOGLE === "true";

/** Whether this browser is designing as a guest (anonymous session). Null until known. */
export function useIsGuest(): boolean | null {
  const [guest, setGuest] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    void createClient()
      .auth.getUser()
      .then(({ data }) => alive && setGuest(Boolean(data.user?.is_anonymous)));
    return () => {
      alive = false;
    };
  }, []);
  return guest;
}

/** Moves this browser's guest drafts to the account that just signed in (no-op without a guest). */
export async function claimGuestDrafts(): Promise<number> {
  try {
    const res = await fetch("/api/guest/claim", { method: "POST" });
    if (!res.ok) return 0;
    return ((await res.json()) as { claimed?: number }).claimed ?? 0;
  } catch {
    return 0;
  }
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/**
 * "Continue with Google". Works for new and existing accounts; a guest's drafts
 * are kept (the auth callback moves them). Hidden unless Google is configured.
 */
export function GoogleButton({ next, label = "Continue with Google" }: { next: string; label?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!googleEnabled()) return null;

  const start = async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    // Refresh this browser's guest marker so the callback can keep the drafts.
    if (data.user?.is_anonymous) await fetch("/api/guest/session", { method: "POST" }).catch(() => undefined);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`, queryParams: { prompt: "select_account" } },
    });
    if (error) {
      setLoading(false);
      setError("Google sign-in isn't available right now. Please use your email instead.");
    }
  };

  return (
    <div className="grid gap-2">
      <Button type="button" variant="outline" size="lg" onClick={start} loading={loading} className="w-full border-border bg-surface shadow-card hover:border-foreground/25 hover:bg-surface" data-testid="google-sign-in">
        {loading ? null : <GoogleMark />}
        {label}
      </Button>
      {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function OrDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground" role="separator" aria-label={label}>
      <span className="h-px flex-1 bg-border" />
      {label}
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Log in / Sign up switch with a sliding thumb. Links keep `next`. */
export function AuthSwitch({ active, next }: { active: "login" | "signup"; next: string }) {
  const q = next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <div className="relative grid h-11 grid-cols-2 rounded-full bg-fill p-1 text-sm font-medium" role="navigation" aria-label="Account">
      <span
        aria-hidden
        className={cn("absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-surface shadow-card transition-transform duration-(--duration-slow) ease-(--ease-out-quart) motion-reduce:transition-none", active === "signup" && "translate-x-full")}
      />
      <Link href={`/login${q}`} aria-current={active === "login" ? "page" : undefined} className={cn("relative z-10 flex items-center justify-center rounded-full transition-colors", active === "login" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
        Log in
      </Link>
      <Link href={`/signup${q}`} aria-current={active === "signup" ? "page" : undefined} className={cn("relative z-10 flex items-center justify-center rounded-full transition-colors", active === "signup" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
        Sign up
      </Link>
    </div>
  );
}

/** Password input with a show/hide toggle (React 19: `ref` arrives as a prop). */
export function PasswordInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className={cn("pr-11", className)} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring outline-none"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    </div>
  );
}

function strength(value: string): number {
  if (!value) return 0;
  let score = value.length >= 8 ? 1 : 0;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.max(1, score);
}

const LEVELS = [
  { label: "", bar: "bg-border" },
  { label: "Weak", bar: "bg-destructive" },
  { label: "Fair", bar: "bg-warning" },
  { label: "Good", bar: "bg-tone-green-ink" },
  { label: "Strong", bar: "bg-success" },
];

/** Four-segment strength meter that fills as the password improves. */
export function StrengthMeter({ value }: { value: string }) {
  const score = strength(value);
  const level = LEVELS[score];
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden>
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className="h-1 overflow-hidden rounded-full bg-border">
            <span className={cn("block h-full origin-left rounded-full transition-[scale,background-color] duration-(--duration-slow) ease-(--ease-out-quart)", level.bar, i <= score ? "scale-x-100" : "scale-x-0")} />
          </span>
        ))}
      </div>
      <span className="w-12 text-right text-xs text-muted-foreground">{level.label}</span>
    </div>
  );
}

/** Reassurance shown when a guest signs in: their draft comes with them. */
export function GuestNotice({ className }: { className?: string }) {
  const guest = useIsGuest();
  if (!guest) return null;
  return (
    <p className={cn("flex items-start gap-2.5 rounded-2xl bg-tone-rose px-4 py-3 text-sm text-tone-rose-ink", className)} data-testid="guest-notice">
      <SparklesIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      Your draft is safe. It moves to your account as soon as you sign in.
    </p>
  );
}

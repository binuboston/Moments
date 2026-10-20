"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Blossom } from "@/components/brand/blossom";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/features/auth/safe-next";
import { ROUTES, routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/client";

/** Visits to /start within this window count as one attempt (loop guard). */
const LOOP_WINDOW_MS = 20_000;
const LOOP_KEY = "invite:start-attempts";

function recentAttempts(): number {
  try {
    const now = Date.now();
    const list = (JSON.parse(sessionStorage.getItem(LOOP_KEY) ?? "[]") as number[]).filter((t) => now - t < LOOP_WINDOW_MS);
    list.push(now);
    sessionStorage.setItem(LOOP_KEY, JSON.stringify(list));
    return list.length;
  } catch {
    return 1;
  }
}

/**
 * Makes sure the browser has a valid session, then continues to `next`.
 *
 * - The session is verified with the auth server (getUser), not just read
 *   from cookies: a deleted or revoked session is cleared and replaced.
 * - A guest session is created in the browser (Supabase rate-limits
 *   anonymous sign-ins per client IP, so never on the server).
 * - Continues with a full page load (the client router may have cached the
 *   server's "no session" redirect).
 * - If this keeps happening (a redirect loop), or a guest session cannot be
 *   created, it stops and offers clear choices instead of bouncing to sign-up.
 */
export function GuestStart() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"), ROUTES.app);
  const started = useRef(false);
  const [failed, setFailed] = useState(false);

  const run = useCallback(async (force: boolean) => {
    setFailed(false);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    // Looping back here with a "valid" session means the server rejects it: start over.
    const looping = !force && recentAttempts() > 2;
    if (!data.user || looping || force) {
      // A rejected session that belonged to a real account (expired or revoked login):
      // ask them to log in again rather than silently swapping their invitations for a guest's.
      const { data: stale } = await supabase.auth.getSession();
      const hadAccount = stale.session?.user && !stale.session.user.is_anonymous;
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      if (hadAccount && !force) {
        window.location.replace(`${routes.login(next)}&error=expired`);
        return;
      }
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        setFailed(true);
        return;
      }
      await fetch("/api/guest/session", { method: "POST" }).catch(() => undefined);
    }
    window.location.replace(next);
  }, [next]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run(false);
  }, [run]);

  return (
    <main className="app-canvas flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <Logo />
      {failed ? (
        <div role="alert" className="surface-card grid max-w-sm gap-4 p-6">
          <p className="text-lg font-semibold tracking-tight">We couldn&apos;t start your studio</p>
          <p className="text-sm text-muted-foreground text-pretty">Guest sessions are busy right now. Try again, or create a free account to keep going.</p>
          <div className="grid gap-2">
            <Button onClick={() => void run(true)}>Try again</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="soft">
                <Link href={routes.login(next)}>Log in</Link>
              </Button>
              <Button asChild variant="soft">
                <Link href={routes.signup(next)}>Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative size-20" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute inset-0 m-auto motion-safe:animate-[spin_6s_linear_infinite]"
                style={{ width: `${5 - i * 1.25}rem`, height: `${5 - i * 1.25}rem`, color: ["var(--color-brand-200)", "var(--color-brand-400)", "var(--primary)"][i], animationDirection: i % 2 ? "reverse" : "normal" }}
              >
                <Blossom className="size-full" />
              </span>
            ))}
          </div>
          <div role="status" aria-live="polite">
            <p className="text-xl font-semibold tracking-tight">Setting up your studio…</p>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground text-pretty">No account needed to start. You&apos;ll only sign in when you&apos;re ready to publish.</p>
          </div>
        </>
      )}
    </main>
  );
}

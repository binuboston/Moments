"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Blossom } from "@/components/brand/blossom";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { CAPTCHA_MESSAGES, useCaptcha } from "@/features/auth/captcha";
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
 * - When Turnstile is configured, it waits for the browser check and sends its
 *   token with the anonymous sign-in (verified by Supabase Auth).
 */
export function GuestStart() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"), ROUTES.app);
  const started = useRef(false);
  const [failed, setFailed] = useState<null | "disabled" | "busy" | "verify">(null);
  const captcha = useCaptcha("guest", { className: "mt-2" });
  const { token: captchaToken, ready: captchaReady, failed: captchaFailed, reset: resetCaptcha } = captcha;

  const run = useCallback(async (force: boolean, token: string | undefined) => {
    setFailed(null);
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
      const { error } = await supabase.auth.signInAnonymously({ options: { captchaToken: token } });
      resetCaptcha();
      if (error) {
        // Guest mode switched off for the project (Supabase: anonymous sign-ins), the browser check failed, or rate-limited.
        setFailed(error.code === "anonymous_provider_disabled" ? "disabled" : error.code === "captcha_failed" ? "verify" : "busy");
        return;
      }
      await fetch("/api/guest/session", { method: "POST" }).catch(() => undefined);
    }
    window.location.replace(next);
  }, [next, resetCaptcha]);

  useEffect(() => {
    if (started.current || !captchaReady) return;
    started.current = true;
    void run(false, captchaToken);
  }, [run, captchaReady, captchaToken]);

  // The browser check could not run (blocked script, widget error): a guest session would be refused.
  const problem = failed ?? (captchaFailed ? "verify" : null);

  return (
    <main className="app-canvas flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <Logo />
      {problem ? (
        <div role="alert" className="surface-card grid max-w-sm gap-4 p-6">
          <p className="text-lg font-semibold tracking-tight">{problem === "disabled" ? "Guest mode isn't available" : "We couldn't start your studio"}</p>
          <p className="text-sm text-muted-foreground text-pretty">
            {problem === "disabled"
              ? "Create a free account or log in to start designing. It only takes a moment."
              : problem === "verify"
                ? `${captchaFailed ? CAPTCHA_MESSAGES.failed : CAPTCHA_MESSAGES.rejected} Or create a free account to keep going.`
                : "Guest sessions are busy right now. Try again, or create a free account to keep going."}
          </p>
          <div className="grid gap-2">
            {problem === "busy" || problem === "verify" ? (
              <Button onClick={() => void run(true, captchaToken)} disabled={!captchaReady}>
                Try again
              </Button>
            ) : null}
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
      {/* Mounted in both states: the check runs while "Setting up", and again before "Try again". */}
      {captcha.widget}
    </main>
  );
}

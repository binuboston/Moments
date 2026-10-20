"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Blossom } from "@/components/brand/blossom";
import { Logo } from "@/components/layout/logo";
import { safeNextPath } from "@/features/auth/safe-next";
import { createClient } from "@/lib/supabase/client";

/**
 * Starts a guest session in the browser (Supabase rate-limits anonymous
 * sign-ins per client IP, so this must not run on the server), remembers it
 * for a later sign-in, then continues to the wizard.
 */
export function GuestStart() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"), "/dashboard/invitations/new");
  const started = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          // Guest sessions disabled or rate-limited: fall back to a normal sign-up.
          setFailed(true);
          router.replace(`/signup?next=${encodeURIComponent(next)}`);
          return;
        }
        await fetch("/api/guest/session", { method: "POST" }).catch(() => undefined);
      }
      router.replace(next);
      router.refresh();
    })();
  }, [next, router]);

  return (
    <main className="app-canvas flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <Logo />
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
        <p className="text-xl font-semibold tracking-tight">{failed ? "Taking you to sign up…" : "Setting up your studio…"}</p>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground text-pretty">No account needed to start. You&apos;ll only sign in when you&apos;re ready to publish.</p>
      </div>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

/*
 * Cloudflare Turnstile for public auth operations (sign-up, log-in, password
 * reset, resend confirmation, guest sessions).
 *
 * The browser only obtains a token; verification happens on the server, in
 * Supabase Auth (Dashboard → Authentication → Attack Protection → CAPTCHA,
 * provider Turnstile, with the secret key). Once that is on, Supabase refuses
 * those calls without a valid, unused token (`captcha_failed`).
 *
 * Rollout (docs/AUTH.md): set NEXT_PUBLIC_TURNSTILE_SITE_KEY and deploy (the
 * widget runs and tokens are sent, but nothing is enforced yet), check it on
 * the live hostname, then switch on enforcement in Supabase. Without a site
 * key the widget is not rendered and no token is sent.
 */

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render(el: HTMLElement, options: Record<string, unknown>): string;
  reset(id: string): void;
  remove(id: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export function captchaSiteKey(): string {
  return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
}

let loader: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loader ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile unavailable")));
    script.onerror = () => reject(new Error("turnstile failed to load"));
    document.head.appendChild(script);
  }).catch((err: unknown) => {
    // Allow a later mount to retry (e.g. after a flaky connection).
    loader = null;
    throw err;
  });
  return loader;
}

export const CAPTCHA_MESSAGES = {
  pending: "Please wait a moment while we check your browser, then try again.",
  failed: "We couldn't verify this browser. Check your connection or turn off content blockers, then reload the page.",
  rejected: "The security check didn't pass. Please try again.",
};

export interface Captcha {
  /** Token for the next request (undefined when Turnstile is not configured). */
  token: string | undefined;
  /** False while a configured widget has not produced a token yet. */
  ready: boolean;
  /** The widget could not load or errored: submitting would be refused. */
  failed: boolean;
  /** The message to show when the form is submitted before the check is ready. */
  blockedMessage: string | null;
  /** Tokens are single-use: call after every request that sent one. */
  reset: () => void;
  widget: React.ReactNode;
}

/**
 * One Turnstile widget. `action` labels the operation in Cloudflare analytics
 * (letters, digits, - and _ only).
 */
export function useCaptcha(action: string, { className }: { className?: string } = {}): Captcha {
  const siteKey = captchaSiteKey();
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!siteKey || !container.current) return;
    let cancelled = false;
    loadTurnstile()
      .then((api) => {
        if (cancelled || !container.current) return;
        widgetId.current = api.render(container.current, {
          sitekey: siteKey,
          action,
          appearance: "interaction-only",
          callback: (t: string) => {
            setFailed(false);
            setToken(t);
          },
          "expired-callback": () => setToken(null),
          "timeout-callback": () => setToken(null),
          "error-callback": () => {
            setToken(null);
            setFailed(true);
          },
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [siteKey, action]);

  const reset = useCallback(() => {
    setToken(null);
    if (widgetId.current) window.turnstile?.reset(widgetId.current);
  }, []);

  const ready = !siteKey || token !== null;
  return {
    token: token ?? undefined,
    ready,
    failed,
    blockedMessage: ready ? null : failed ? CAPTCHA_MESSAGES.failed : CAPTCHA_MESSAGES.pending,
    reset,
    widget: siteKey ? <div ref={container} className={cn("flex justify-center empty:hidden", className)} data-testid="captcha" /> : null,
  };
}

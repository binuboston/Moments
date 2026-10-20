"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Account } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/client";

interface AccountContextValue {
  /** undefined = not known yet, null = signed out. */
  account: Account | null | undefined;
  /** Starts resolving the account (once) the first time someone asks for it. */
  ensure: () => void;
}

const AccountContext = createContext<AccountContextValue | null>(null);

async function fetchAccount(): Promise<Account | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("full_name, role, plan").eq("id", user.id).maybeSingle();
  return {
    name: profile?.full_name || (user.user_metadata?.full_name as string | undefined) || "",
    email: user.email ?? "",
    role: profile?.role ?? "user",
    plan: profile?.plan ?? "free",
    isGuest: Boolean(user.is_anonymous),
  };
}

/**
 * The single source of "who is using the app" in the browser.
 *
 * - The root provider (app/providers.tsx) resolves it lazily, only when a
 *   component asks, and follows sign-in and sign-out.
 * - The app shell nests a provider with the server-known `account`, so app
 *   pages render the right state immediately (no flash, no extra request).
 */
export function AccountProvider({ account: known, children }: { account?: Account | null; children: React.ReactNode }) {
  const [resolved, setResolved] = useState<Account | null | undefined>(undefined);
  const started = useRef(false);
  const unsubscribe = useRef<(() => void) | null>(null);

  const ensure = useCallback(() => {
    if (known !== undefined || started.current) return;
    started.current = true;
    const refresh = () => void fetchAccount().then(setResolved);
    refresh();
    const { data } = createClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") refresh();
    });
    unsubscribe.current = () => data.subscription.unsubscribe();
  }, [known]);

  useEffect(() => () => unsubscribe.current?.(), []);

  return <AccountContext.Provider value={{ account: known !== undefined ? known : resolved, ensure }}>{children}</AccountContext.Provider>;
}

/** The current account: undefined while unknown, null when signed out. */
export function useAccount(): Account | null | undefined {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used inside <AccountProvider>");
  const { ensure } = ctx;
  useEffect(() => ensure(), [ensure]);
  return ctx.account;
}

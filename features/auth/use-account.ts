"use client";

import { useEffect, useState } from "react";
import type { Account } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/client";

/**
 * The signed-in account for client-rendered chrome. Pass `initial` when the
 * server already knows it (the app); otherwise (static marketing pages) it is
 * resolved in the browser and kept in sync with sign-in and sign-out.
 * `undefined` means "not known yet".
 */
export function useAccount(initial?: Account | null): Account | null | undefined {
  const [account, setAccount] = useState<Account | null | undefined>(initial);

  useEffect(() => {
    if (initial !== undefined) return;
    const supabase = createClient();
    let alive = true;

    const resolve = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        if (alive) setAccount(null);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("full_name, role, plan").eq("id", user.id).maybeSingle();
      if (!alive) return;
      setAccount({
        name: profile?.full_name || (user.user_metadata?.full_name as string | undefined) || "",
        email: user.email ?? "",
        role: profile?.role ?? "user",
        plan: profile?.plan ?? "free",
        isGuest: Boolean(user.is_anonymous),
      });
    };

    void resolve();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void resolve();
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [initial]);

  return initial !== undefined ? initial : account;
}

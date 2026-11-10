import "server-only";

import { redirect } from "next/navigation";
import type { Account } from "@/lib/auth/account";
import { routes } from "@/lib/routes";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

/**
 * The signed-in account holder. Anyone else (signed out, or a leftover
 * anonymous session) is sent to log in and comes back to `next`. The proxy
 * normally does this first; this is the page-level guarantee.
 */
export async function requireAccount(next?: string) {
  const user = await getCurrentUser();
  if (!user || user.is_anonymous) redirect(routes.login(next));
  return user;
}

/** Account details for the header, resolved on the server (no flash in the app). */
export async function getAccount(): Promise<Account | null> {
  const user = await getCurrentUser();
  if (!user || user.is_anonymous) return null;
  const profile = await getCurrentProfile();
  return {
    name: profile?.full_name || (user.user_metadata?.full_name as string | undefined) || "",
    email: user.email ?? "",
    role: profile?.role ?? "user",
    plan: profile?.plan ?? "free",
  };
}

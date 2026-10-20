import "server-only";

import { redirect } from "next/navigation";
import type { Account } from "@/lib/auth/account";
import { routes } from "@/lib/routes";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

/**
 * The current app user (a guest or an account holder). Visitors without a
 * session are sent to start a guest session and come back to `next`. The
 * proxy normally does this first; this is the page-level guarantee.
 */
export async function requireAppUser(next?: string) {
  const user = await getCurrentUser();
  if (!user) redirect(routes.start(next));
  return user;
}

/** Account details for the header, resolved on the server (no flash in the app). */
export async function getAccount(): Promise<Account | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await getCurrentProfile();
  return {
    name: profile?.full_name || (user.user_metadata?.full_name as string | undefined) || "",
    email: user.email ?? "",
    role: profile?.role ?? "user",
    plan: profile?.plan ?? "free",
    isGuest: Boolean(user.is_anonymous),
  };
}

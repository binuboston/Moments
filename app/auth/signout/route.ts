import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Session policy (docs/AUTH.md):
 * - Log out (default): this device only. Other browsers stay signed in.
 * - `?scope=global` ("Log out everywhere", for a suspected compromise): revokes
 *   every refresh token for the account, this device included.
 * - Password reset (ResetPasswordForm): revokes all other sessions.
 */
export async function POST(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") === "global" ? "global" : "local";
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope });
  // A failed global revocation must not look like success; local sign-out always clears this device's cookies.
  if (error && scope === "global") {
    await supabase.auth.signOut({ scope: "local" });
    return NextResponse.json({ code: "signout_failed", message: "We couldn't sign out your other devices. Please try again." }, { status: 502 });
  }
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

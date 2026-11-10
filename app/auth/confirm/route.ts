import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/features/auth/safe-next";
import { claimGuestDrafts } from "@/lib/auth/guest";
import { ROUTES } from "@/lib/routes";

/** Email link types this route accepts (everything else is rejected). */
const TYPES: readonly EmailOtpType[] = ["signup", "email", "recovery", "invite", "email_change"];
const isType = (v: string | null): v is EmailOtpType => v !== null && (TYPES as readonly string[]).includes(v);

/**
 * Email links (confirmation, password recovery, invites, email changes). The
 * link carries a one-time token hash (supabase/templates/*.html), verified
 * server-side, so it works on any device, unlike PKCE codes (/auth/callback).
 * Legacy: drafts from an earlier guest session in this browser move to the
 * account before redirecting (lib/auth/guest.ts).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next"));

  if (tokenHash && isType(type)) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      if (data.user && !data.user.is_anonymous) await claimGuestDrafts(data.user.id);
      return NextResponse.redirect(`${origin}${type === "recovery" ? ROUTES.resetPassword : next}`);
    }
  }

  // Invalid, used or expired: recovery gets its own page to request a new link.
  const failed = type === "recovery" ? `${ROUTES.forgotPassword}?error=link` : `${ROUTES.login}?error=link`;
  return NextResponse.redirect(`${origin}${failed}`);
}

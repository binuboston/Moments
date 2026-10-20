import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/features/auth/safe-next";
import { claimGuestDrafts } from "@/lib/auth/guest";

/**
 * Exchanges the PKCE code from OAuth (Google) and email links (confirmation,
 * recovery) for a session. If this browser was designing as a guest, the
 * guest's drafts move to the signed-in account before redirecting.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data.user && !data.user.is_anonymous) await claimGuestDrafts(data.user.id);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // OAuth providers report cancellations and failures as ?error=…
  const reason = searchParams.get("error") ? "oauth" : "auth";
  return NextResponse.redirect(`${origin}/login?error=${reason}`);
}

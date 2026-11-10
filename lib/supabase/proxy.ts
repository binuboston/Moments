import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { needsAccount, ROUTES } from "@/lib/routes";

/** Admin pages need an account too (and the admin role, checked by the pages). */
const ADMIN_PREFIX = ROUTES.admin;
/**
 * Pages a signed-in account holder is sent away from. Forgot-password is not
 * one of them: it explains expired reset links, and asking for a reset while
 * signed in is legitimate.
 */
const AUTH_PAGES: readonly string[] = [ROUTES.login, ROUTES.signup];

/**
 * Refreshes the Supabase session cookie on every matched request and applies
 * coarse redirects. Pages and route handlers re-verify authorisation; this is a
 * convenience layer, not the security boundary.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims validates the JWT (locally when asymmetric keys are configured)
  // and triggers a refresh when needed. Do not add logic between client
  // creation and this call.
  const { data } = await supabase.auth.getClaims();
  // An anonymous session (left over from the retired guest mode) counts as signed out.
  const isAuthenticated = Boolean(data?.claims?.sub) && data?.claims?.is_anonymous !== true;

  const { pathname, search } = request.nextUrl;

  const under = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);
  if (!isAuthenticated && (needsAccount(pathname) || under(ADMIN_PREFIX))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = ROUTES.login;
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated && AUTH_PAGES.includes(pathname)) {
    // Confirm with the auth server first: a deleted or revoked account still
    // carries a valid-looking token, and must be able to log in again here.
    const { data: confirmed } = await supabase.auth.getUser();
    if (!confirmed.user || confirmed.user.is_anonymous) return response;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = ROUTES.app;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

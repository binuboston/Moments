import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { isAppPath, ROUTES } from "@/lib/routes";

/** App pages that need a session open to everyone (guests get one first); admin needs a real login. */
const ADMIN_PREFIX = ROUTES.admin;
const AUTH_PAGES: readonly string[] = [ROUTES.login, ROUTES.signup, ROUTES.forgotPassword];

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
  const isAuthenticated = Boolean(data?.claims?.sub);
  // Guests (anonymous sessions) may design drafts but are not "logged in" for auth pages.
  const isGuest = data?.claims?.is_anonymous === true;

  const { pathname, search } = request.nextUrl;

  const under = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);
  const needsSession = isAppPath(pathname);
  if (!isAuthenticated && (needsSession || under(ADMIN_PREFIX))) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = needsSession ? ROUTES.start : ROUTES.login;
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthenticated && !isGuest && AUTH_PAGES.includes(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = ROUTES.app;
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

"use client";

import Link from "next/link";
import { useAccount } from "@/features/auth/account-context";
import { needsAccount, routes } from "@/lib/routes";

type AppLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/** next/link props that must not reach a plain <a>. */
const LINK_ONLY_PROPS = ["replace", "scroll", "shallow", "locale", "onNavigate", "legacyBehavior", "passHref"];

/**
 * The way into the app from anywhere. For signed-out visitors, links to
 * account pages go straight to log-in (returning to the page) with a full page
 * load: the client router must never cache the server's "no session"
 * redirect. Everyone else gets a normal client link.
 */
export function AppLink({ href, prefetch, ...props }: AppLinkProps) {
  const account = useAccount();
  if (account === null && needsAccount(href)) {
    const anchor: Record<string, unknown> = { ...props };
    for (const key of LINK_ONLY_PROPS) delete anchor[key];
    return <a href={routes.login(href)} {...(anchor as React.ComponentProps<"a">)} />;
  }
  // While the session is unknown, avoid prefetching app pages (that would cache a redirect).
  return <Link href={href} prefetch={account === undefined && needsAccount(href) ? false : prefetch} {...props} />;
}

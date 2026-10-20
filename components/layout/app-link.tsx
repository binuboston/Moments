"use client";

import Link from "next/link";
import { useAccount } from "@/features/auth/account-context";
import { isAppPath, routes } from "@/lib/routes";

type AppLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & { href: string };

/** next/link props that must not reach a plain <a>. */
const LINK_ONLY_PROPS = ["replace", "scroll", "shallow", "locale", "onNavigate", "legacyBehavior", "passHref"];

/**
 * The way into the app from anywhere. For signed-out visitors, links to app
 * pages go straight to guest setup with a full page load: the client router
 * must never cache the server's "no session" redirect (that is what left
 * people stuck on the setup screen). Everyone else gets a normal client link.
 */
export function AppLink({ href, prefetch, ...props }: AppLinkProps) {
  const account = useAccount();
  if (account === null && isAppPath(href)) {
    const anchor: Record<string, unknown> = { ...props };
    for (const key of LINK_ONLY_PROPS) delete anchor[key];
    return <a href={routes.start(href)} {...(anchor as React.ComponentProps<"a">)} />;
  }
  // While the session is unknown, avoid prefetching app pages (that would cache a redirect).
  return <Link href={href} prefetch={account === undefined && isAppPath(href) ? false : prefetch} {...props} />;
}

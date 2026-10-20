/**
 * App routes in one place. Everything links through these so the structure
 * (marketing site, the app at /dashboard, auth) can change in one file.
 */
export const ROUTES = {
  home: "/",
  templates: "/templates",
  howItWorks: "/how-it-works",
  pricing: "/pricing",
  help: "/help",
  /** The app. Open to everyone: signed-out visitors get a guest session first. */
  app: "/dashboard",
  invitations: "/dashboard/invitations",
  newInvitation: "/dashboard/invitations/new",
  settings: "/dashboard/settings",
  login: "/login",
  signup: "/signup",
  /** Starts a guest session in the browser, then continues to `next`. */
  start: "/start",
} as const;

/** The one navigation shared by the marketing site and the app header. */
export const PRIMARY_NAV = [
  { href: ROUTES.templates, label: "Templates" },
  { href: ROUTES.howItWorks, label: "How it works" },
  { href: ROUTES.pricing, label: "Pricing" },
  { href: ROUTES.app, label: "My invitations" },
] as const;

export function isActivePath(pathname: string, href: string): boolean {
  return href === ROUTES.home ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Full-screen task flows (wizard, editor) with their own fixed action bars. */
export function isFocusedFlow(pathname: string): boolean {
  return pathname.startsWith(ROUTES.newInvitation) || /\/dashboard\/invitations\/[^/]+\/edit/.test(pathname);
}

export function startPath(next: string = ROUTES.app): string {
  return `${ROUTES.start}?next=${encodeURIComponent(next)}`;
}

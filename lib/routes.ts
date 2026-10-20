/**
 * Every route in the product, in one place. Link through `ROUTES` (static
 * paths) and `routes` (paths with parameters); a lint rule rejects path
 * literals elsewhere, so the structure can change in this file alone.
 */
export const ROUTES = {
  home: "/",
  templates: "/templates",
  howItWorks: "/how-it-works",
  pricing: "/pricing",
  help: "/help",
  privacy: "/help#privacy",
  terms: "/help#terms",

  /** The app. Open to everyone: signed-out visitors get a guest session first. */
  app: "/dashboard",
  invitations: "/dashboard/invitations",
  newInvitation: "/dashboard/invitations/new",
  settings: "/dashboard/settings",
  security: "/dashboard/settings#security",

  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  /** Starts a guest session in the browser, then continues to `next`. */
  start: "/start",
  authCallback: "/auth/callback",
  signOut: "/auth/signout",

  admin: "/admin",
  adminTemplates: "/admin/templates",
  adminEvents: "/admin/events",
  adminCategories: "/admin/categories",

  /** Prefix of public invitation pages (see `routes.invitation`). */
  publicInvitations: "/e/",
  /** Prefix of live template demos (see `routes.demo`). */
  demos: "/demo/",
} as const;

const withNext = (path: string, next?: string) => (next ? `${path}?next=${encodeURIComponent(next)}` : path);

/** Paths with parameters. */
export const routes = {
  template: (slug: string) => `${ROUTES.templates}/${slug}`,
  templatesFor: (category: string) => `${ROUTES.templates}?category=${encodeURIComponent(category)}`,
  demo: (slug: string) => `${ROUTES.demos}${slug}`,
  /** The guest-facing invitation page. */
  invitation: (slug: string) => `${ROUTES.publicInvitations}${slug}`,
  invitationImage: (slug: string) => `${ROUTES.publicInvitations}${slug}/opengraph-image`,
  newInvitation: (opts: { template?: string; category?: string } = {}) => {
    const q = new URLSearchParams(Object.entries(opts).filter(([, v]) => Boolean(v)) as [string, string][]).toString();
    return q ? `${ROUTES.newInvitation}?${q}` : ROUTES.newInvitation;
  },
  editInvitation: (id: string) => `${ROUTES.invitations}/${id}/edit`,
  invitationResponses: (id: string) => `${ROUTES.invitations}/${id}/rsvps`,
  invitationsWithStatus: (status: "draft" | "published" | "unpublished") => `${ROUTES.invitations}?status=${status}`,
  login: (next?: string) => withNext(ROUTES.login, next),
  signup: (next?: string) => withNext(ROUTES.signup, next),
  /** Guest-session entry that returns to `next`. */
  start: (next: string = ROUTES.app) => withNext(ROUTES.start, next),
  authCallback: (next: string) => withNext(ROUTES.authCallback, next),
};

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

/** Paths inside the app (where signed-out visitors need a guest session first). */
export function isAppPath(path: string): boolean {
  const pathname = path.split(/[?#]/)[0];
  return pathname === ROUTES.app || pathname.startsWith(`${ROUTES.app}/`);
}

/** Full-screen task flows (wizard, editor) with their own fixed action bars. */
export function isFocusedFlow(pathname: string): boolean {
  return pathname.startsWith(ROUTES.newInvitation) || (pathname.startsWith(`${ROUTES.invitations}/`) && pathname.endsWith("/edit"));
}

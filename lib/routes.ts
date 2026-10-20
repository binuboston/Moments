/**
 * Every route in the product, in one place. Link through `ROUTES` (static
 * paths) and `routes` (paths with parameters); a lint rule rejects path
 * literals elsewhere, so the structure can change in this file alone.
 */
export const ROUTES = {
  /** The app home: your invitations and designs to start from. Works without an account. */
  home: "/",
  /** The marketing landing page (linked from the Settings & support menu). */
  about: "/about",
  templates: "/templates",
  howItWorks: "/how-it-works",
  pricing: "/pricing",
  help: "/help",
  privacy: "/help#privacy",
  terms: "/help#terms",

  /** Alias of home (the app is the index). */
  app: "/",
  /** Pages below here need a session: signed-out visitors get a guest session first. */
  invitations: "/invitations",
  newInvitation: "/invitations/new",
  settings: "/settings",
  security: "/settings#security",

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

/** Main navigation (rail on desktop, tab bar on phones). */
export const PRIMARY_NAV = [
  { key: "home", href: ROUTES.home, label: "Home" },
  { key: "templates", href: ROUTES.templates, label: "Templates" },
  { key: "create", href: ROUTES.newInvitation, label: "Create" },
  { key: "invitations", href: ROUTES.invitations, label: "Invitations" },
] as const;

/** The Settings & support menu: product, help and legal pages. */
export const SUPPORT_NAV = [
  { href: ROUTES.howItWorks, label: "How it works" },
  { href: ROUTES.pricing, label: "Pricing" },
  { href: ROUTES.help, label: "Help centre" },
  { href: ROUTES.about, label: "About Invite" },
  { href: ROUTES.terms, label: "Terms of service" },
  { href: ROUTES.privacy, label: "Privacy" },
] as const;

export function isActivePath(pathname: string, href: string): boolean {
  return href === ROUTES.home ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** App pages that need a session (signed-out visitors get a guest session first). Home does not. */
export const SESSION_PREFIXES = [ROUTES.invitations, ROUTES.settings] as const;

export function isAppPath(path: string): boolean {
  const pathname = path.split(/[?#]/)[0];
  return SESSION_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Full-screen task flows (wizard, editor) with their own fixed action bars. */
export function isFocusedFlow(pathname: string): boolean {
  return pathname.startsWith(ROUTES.newInvitation) || (pathname.startsWith(`${ROUTES.invitations}/`) && pathname.endsWith("/edit"));
}

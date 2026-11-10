/**
 * Every route in the product, in one place. Link through `ROUTES` (static
 * paths) and `routes` (paths with parameters); a lint rule rejects path
 * literals elsewhere, so the structure can change in this file alone.
 */
export const ROUTES = {
  /** Home: the dashboard for account holders; the Create flow for visitors (see `createFlowPath`). */
  home: "/",
  /** The marketing landing page (linked from the Settings & support menu). */
  about: "/about",
  /** Prefix of the per-design pages (`routes.template`). Browsing designs happens on Home; `/templates` itself redirects there. */
  templates: "/templates",
  howItWorks: "/how-it-works",
  pricing: "/pricing",
  help: "/help",
  privacy: "/help#privacy",
  terms: "/help#terms",
  /** Full results for the header search (works with or without an account). */
  search: "/search",

  /** Alias of home (the app is the index). */
  app: "/",
  /** The Create flow for account holders (the Create tab). Visitors have it on Home; see `createFlowPath`. */
  newInvitation: "/create",
  /** Pages below here need an account. */
  invitations: "/invitations",
  settings: "/settings",
  security: "/settings#security",

  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  /** Old guest entry point: now redirects to sign-up, keeping `next`. */
  start: "/start",
  authCallback: "/auth/callback",
  authConfirm: "/auth/confirm",
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
  /** Home's Create flow, at an occasion's designs (and a selected design). */
  browse: (opts: { category?: string; template?: string } = {}) => {
    const q = new URLSearchParams(Object.entries(opts).filter(([, v]) => Boolean(v)) as [string, string][]).toString();
    return q ? `${ROUTES.home}?${q}` : ROUTES.home;
  },
  /** Full-screen live demo with sample content, optionally for one occasion. */
  demo: (slug: string, occasion?: string) => `${ROUTES.demos}${slug}${occasion ? `?occasion=${encodeURIComponent(occasion)}` : ""}`,
  /** The guest-facing invitation page. */
  invitation: (slug: string) => `${ROUTES.publicInvitations}${slug}`,
  invitationImage: (slug: string) => `${ROUTES.publicInvitations}${slug}/opengraph-image`,
  newInvitation: (opts: { template?: string; category?: string; key?: string } = {}) => {
    const q = new URLSearchParams(Object.entries(opts).filter(([, v]) => Boolean(v)) as [string, string][]).toString();
    return q ? `${ROUTES.newInvitation}?${q}` : ROUTES.newInvitation;
  },
  editInvitation: (id: string) => `${ROUTES.invitations}/${id}/edit`,
  invitationResponses: (id: string) => `${ROUTES.invitations}/${id}/rsvps`,
  invitationsWithStatus: (status: "draft" | "published" | "unpublished") => `${ROUTES.invitations}?status=${status}`,
  login: (next?: string) => withNext(ROUTES.login, next),
  signup: (next?: string) => withNext(ROUTES.signup, next),
  authCallback: (next: string) => withNext(ROUTES.authCallback, next),
  /** Email links (confirmation, recovery): token-hash or code, any device. */
  authConfirm: (next: string) => withNext(ROUTES.authConfirm, next),
  search: (q: string) => (q.trim() ? `${ROUTES.search}?q=${encodeURIComponent(q.trim())}` : ROUTES.search),
  helpSection: (id: string) => `${ROUTES.help}#${id}`,
};

/** Who navigation is for: an account holder, a visitor, or not known yet (the account still loading in the browser). */
export type NavAudience = "account" | "visitor" | "unknown";

export interface NavItem {
  key: "home" | "create" | "invitations" | "login";
  href: string;
  label: string;
  /** Paths (and their subpaths) where this item is the current one. */
  activeOn: readonly string[];
  /** Phones only: the desktop top bar already has its own "Log in". */
  tabsOnly?: boolean;
}

/**
 * Main navigation (rail on desktop, tab bar on phones), per audience. Only
 * what that person can use, and never two entries for the same screen:
 * - account holder: Home (dashboard), Create (the flow), Invitations;
 * - visitor: nothing but Log in on phones. Their Home *is* the Create flow,
 *   and the desktop top bar has its own Log in;
 * - unknown (account still loading in the browser): nothing yet, so nobody
 *   briefly sees the wrong tabs.
 */
export function primaryNav(audience: NavAudience): NavItem[] {
  if (audience === "account") {
    return [
      { key: "home", href: ROUTES.home, label: "Home", activeOn: [ROUTES.home] },
      { key: "create", href: ROUTES.newInvitation, label: "Create", activeOn: [ROUTES.newInvitation] },
      { key: "invitations", href: ROUTES.invitations, label: "Invitations", activeOn: [ROUTES.invitations] },
    ];
  }
  if (audience === "unknown") return [];
  return [{ key: "login", href: ROUTES.login, label: "Log in", activeOn: [ROUTES.login, ROUTES.signup], tabsOnly: true }];
}

/**
 * Where the Create flow lives for each audience: Home for visitors (it is
 * their front door), /create for account holders (their Home is the
 * dashboard). Each page sends the other audience to its address, keeping the
 * choice (`?category`, `?template`, `?key`).
 */
export function createFlowPath(audience: Exclude<NavAudience, "unknown">, query = ""): string {
  const base = audience === "account" ? ROUTES.newInvitation : ROUTES.home;
  return query ? `${base}?${query}` : base;
}

/** The Create flow's choice in a URL query (what the flow pages pass along when redirecting). */
export const CREATE_FLOW_PARAMS = ["category", "template", "key"] as const;

export function isNavActive(pathname: string, item: NavItem): boolean {
  return item.activeOn.some((href) => isActivePath(pathname, href));
}

/** The account holder's main navigation (for things that list the app's pages, e.g. search). */
export const PRIMARY_NAV = primaryNav("account");

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

/** App pages that need an account. Home and the Create wizard do not. */
export const ACCOUNT_PREFIXES = [ROUTES.invitations, ROUTES.settings] as const;

/** True when the path (with or without query) needs a signed-in account; signed-out visitors are sent to log in. */
export function needsAccount(path: string): boolean {
  const pathname = path.split(/[?#]/)[0];
  return ACCOUNT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

const isEditor = (pathname: string) => pathname.startsWith(`${ROUTES.invitations}/`) && pathname.endsWith("/edit");

/** Task flows with their own fixed action bars (wizard, editor): page-entrance motion skips them. */
export function isFocusedFlow(pathname: string): boolean {
  return pathname.startsWith(ROUTES.newInvitation) || isEditor(pathname);
}

/**
 * Screens whose own bottom bar replaces the phone tab bar: only the editor.
 * The wizard keeps the tabs (it is the Create tab) and stacks its action bar above them.
 */
export function hidesTabBar(pathname: string): boolean {
  return isEditor(pathname);
}

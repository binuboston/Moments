import { LayoutDashboardIcon, LogInIcon, LogOutIcon, SettingsIcon, ShieldIcon, SparklesIcon, UserPlusIcon, type LucideIcon } from "lucide-react";
import type { Account } from "@/lib/auth/account";
import { ROUTES } from "@/lib/routes";
import { initials } from "@/lib/utils/format";

export interface AccountAction {
  key: "start" | "signup" | "login" | "upgrade" | "app" | "settings" | "admin" | "signOut";
  label: string;
  icon: LucideIcon;
  /** Navigation target; absent for `signOut`, which is an action. */
  href?: string;
}

export interface AccountView {
  /** Who is signed in (null when signed out). */
  identity: { title: string; subtitle: string; avatar: { kind: "guest" } | { kind: "initials"; text: string }; plan?: Account["plan"] } | null;
  /** The one emphasised next step for this state. */
  primary: AccountAction | null;
  /** Everything else, in display order. */
  actions: AccountAction[];
}

const A = {
  start: { key: "start", label: "Start creating, no account needed", icon: SparklesIcon, href: ROUTES.newInvitation },
  signup: { key: "signup", label: "Create free account", icon: UserPlusIcon, href: ROUTES.signup },
  login: { key: "login", label: "Log in", icon: LogInIcon, href: ROUTES.login },
  upgrade: { key: "upgrade", label: "Upgrade to Pro", icon: SparklesIcon, href: ROUTES.pricing },
  app: { key: "app", label: "My invitations", icon: LayoutDashboardIcon, href: ROUTES.app },
  settings: { key: "settings", label: "Settings", icon: SettingsIcon, href: ROUTES.settings },
  admin: { key: "admin", label: "Admin", icon: ShieldIcon, href: ROUTES.admin },
  signOut: { key: "signOut", label: "Log out", icon: LogOutIcon },
} satisfies Record<string, AccountAction>;

/**
 * What the account UI offers in each state: signed out, guest, account
 * holder. The desktop menu and the phone menu both render this, so they can
 * never disagree.
 */
export function accountView(account: Account | null): AccountView {
  if (!account) return { identity: null, primary: A.start, actions: [A.login, { ...A.signup, label: "Sign up" }] };

  if (account.isGuest) {
    return {
      identity: { title: "Guest", subtitle: "Your drafts are saved in this browser.", avatar: { kind: "guest" } },
      primary: A.signup,
      // No sign-out for guests: it would lose their drafts.
      actions: [A.app, A.login],
    };
  }

  return {
    identity: { title: account.name || "Your account", subtitle: account.email, avatar: { kind: "initials", text: initials(account.name || account.email) }, plan: account.plan },
    primary: account.plan === "free" ? A.upgrade : null,
    actions: [A.app, A.settings, ...(account.role === "admin" ? [A.admin] : []), A.signOut],
  };
}

import { HouseIcon, LogInIcon, MailIcon, PlusIcon, type LucideIcon } from "lucide-react";
import type { Account } from "@/lib/auth/account";
import { primaryNav, type NavAudience, type NavItem } from "@/lib/routes";

const ICONS: Record<NavItem["key"], LucideIcon> = {
  home: HouseIcon,
  create: PlusIcon,
  invitations: MailIcon,
  login: LogInIcon,
};

/** The navigation audience for the current account (undefined while it is still loading). */
export function navAudience(account: Account | null | undefined): NavAudience {
  return account === undefined ? "unknown" : account ? "account" : "visitor";
}

/** Primary navigation with icons for this account, shared by the side rail and the phone tab bar. */
export function navItems(account: Account | null | undefined): (NavItem & { icon: LucideIcon })[] {
  return primaryNav(navAudience(account)).map((item) => ({ ...item, icon: ICONS[item.key] }));
}

import { CompassIcon, HouseIcon, MailIcon, PlusIcon, type LucideIcon } from "lucide-react";
import { PRIMARY_NAV } from "@/lib/routes";

const ICONS: Record<(typeof PRIMARY_NAV)[number]["key"], LucideIcon> = {
  home: HouseIcon,
  templates: CompassIcon,
  create: PlusIcon,
  invitations: MailIcon,
};

/** Primary navigation with icons, shared by the side rail and the phone tab bar. */
export const NAV_ITEMS = PRIMARY_NAV.map((item) => ({ ...item, icon: ICONS[item.key] }));

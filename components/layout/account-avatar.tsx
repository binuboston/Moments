import { UserRoundIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AccountView } from "@/lib/auth/account-actions";

export function AccountAvatar({ identity }: { identity: NonNullable<AccountView["identity"]> }) {
  return (
    <Avatar>
      <AvatarFallback>{identity.avatar.kind === "guest" ? <UserRoundIcon className="size-4" aria-hidden /> : identity.avatar.text}</AvatarFallback>
    </Avatar>
  );
}

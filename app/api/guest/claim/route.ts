import { handle, json, requireUser } from "@/lib/api/respond";
import { claimGuestDrafts } from "@/lib/auth/guest";

/** LEGACY (see lib/auth/guest.ts): after an in-page sign-in, moves drafts left by an earlier guest session in this browser. */
export const POST = handle(async () => {
  const { user } = await requireUser();
  return json({ claimed: await claimGuestDrafts(user.id) });
});

import { ApiError, handle, json, requireUser } from "@/lib/api/respond";
import { claimGuestDrafts } from "@/lib/auth/guest";

/** After an in-page sign-in (email and password): moves this browser's guest drafts to the account. */
export const POST = handle(async () => {
  const { user } = await requireUser();
  if (user.is_anonymous) throw new ApiError(400, "Sign in first.", "guest");
  return json({ claimed: await claimGuestDrafts(user.id) });
});

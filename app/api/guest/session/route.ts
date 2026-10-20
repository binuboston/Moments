import { ApiError, handle, json, requireUser } from "@/lib/api/respond";
import { rememberGuest } from "@/lib/auth/guest";

/** Called right after the browser starts a guest session: remembers it so a later sign-in can keep its drafts. */
export const POST = handle(async () => {
  const { user } = await requireUser();
  if (!user.is_anonymous) throw new ApiError(400, "Already signed in.", "not_guest");
  await rememberGuest(user.id);
  return json({ ok: true });
});

import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

/*
 * LEGACY: retired guest mode. Remove after 2026-11-30 (30 days after the last
 * guest session could be created), together with /api/guest/claim and the
 * claim calls in the auth routes.
 *
 * Visitors used to start invitations as anonymous Supabase users, remembered
 * by a signed, httpOnly cookie. Creating now needs an account, so nothing sets
 * the cookie any more; this only rescues drafts left by an earlier guest
 * session in the same browser when that person signs in.
 */

export const GUEST_CLAIM_COOKIE = "mirth_guest";

function key(): Buffer | null {
  const secret = serverEnv().SUPABASE_SERVICE_ROLE_KEY;
  return secret ? createHash("sha256").update(`mirth-guest-claim:${secret}`).digest() : null;
}

function sign(payload: string, k: Buffer) {
  return createHmac("sha256", k).update(payload).digest("base64url");
}

export function verifyClaimToken(token: string | undefined, now = Date.now()): string | null {
  const k = key();
  if (!k || !token) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = Buffer.from(sign(payload, k));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { sub?: string; exp?: number };
    return typeof sub === "string" && typeof exp === "number" && exp > now ? sub : null;
  } catch {
    return null;
  }
}

/**
 * Moves the remembered guest's invitations, and their photos, to `userId`,
 * then deletes the guest. Safe to call on every sign-in: without a valid
 * cookie it does nothing. Returns the number of invitations moved.
 */
export async function claimGuestDrafts(userId: string): Promise<number> {
  const jar = await cookies();
  const guestId = verifyClaimToken(jar.get(GUEST_CLAIM_COOKIE)?.value);
  if (!guestId || guestId === userId) return 0;
  try {
    const admin = createAdminClient();
    // Only ever move data away from a guest account.
    const { data: guest } = await admin.auth.admin.getUserById(guestId);
    if (!guest.user?.is_anonymous) {
      jar.delete(GUEST_CLAIM_COOKIE);
      return 0;
    }
    // Photos first: their rows are owned by the guest too and would be deleted with it.
    const { error: mediaError } = await admin.from("invitation_media").update({ owner_id: userId }).eq("owner_id", guestId);
    if (mediaError) throw mediaError;
    const { data: moved, error } = await admin.from("invitations").update({ owner_id: userId }).eq("owner_id", guestId).select("id");
    if (error) throw error;
    // Only once everything has moved: deleting the guest cascades to whatever it still owns.
    await admin.auth.admin.deleteUser(guestId);
    jar.delete(GUEST_CLAIM_COOKIE);
    return moved?.length ?? 0;
  } catch (error) {
    console.error("[guest] claim failed:", error);
    return 0;
  }
}

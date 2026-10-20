import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

/*
 * Guest drafts. Visitors can start an invitation as an anonymous Supabase user.
 * When they later sign in with a different identity (Google, an existing email
 * account), their drafts are moved to that account. The browser holds a signed,
 * httpOnly cookie naming the guest user; only the server can mint or read it.
 */

export const GUEST_CLAIM_COOKIE = "mirth_guest";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function key(): Buffer | null {
  const secret = serverEnv().SUPABASE_SERVICE_ROLE_KEY;
  return secret ? createHash("sha256").update(`mirth-guest-claim:${secret}`).digest() : null;
}

function sign(payload: string, k: Buffer) {
  return createHmac("sha256", k).update(payload).digest("base64url");
}

export function createClaimToken(guestId: string, now = Date.now()): string | null {
  const k = key();
  if (!k) return null;
  const payload = Buffer.from(JSON.stringify({ sub: guestId, exp: now + MAX_AGE_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload, k)}`;
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

/** Remembers the current guest in this browser (call while the guest session is active). */
export async function rememberGuest(guestId: string) {
  const token = createClaimToken(guestId);
  if (!token) return;
  (await cookies()).set(GUEST_CLAIM_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/**
 * Moves the remembered guest's invitations to `userId` and deletes the guest.
 * Safe to call on every sign-in: without a valid cookie it does nothing.
 * Returns the number of invitations moved.
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
    const { data: moved, error } = await admin.from("invitations").update({ owner_id: userId }).eq("owner_id", guestId).select("id");
    if (error) throw error;
    await admin.auth.admin.deleteUser(guestId);
    jar.delete(GUEST_CLAIM_COOKIE);
    return moved?.length ?? 0;
  } catch (error) {
    console.error("[guest] claim failed:", error);
    return 0;
  }
}

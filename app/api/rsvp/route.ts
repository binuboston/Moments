import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { ApiError, errorResponse, handle, json, readJson } from "@/lib/api/respond";
import { serverEnv } from "@/lib/env";
import { createAnonClient } from "@/lib/supabase/server";
import { rsvpSubmissionSchema } from "@/lib/validation/rsvp";

const MAX_BODY_BYTES = 8 * 1024;

function hashIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
  if (!ip) return "";
  return createHash("sha256").update(`${serverEnv().RSVP_IP_SALT}:${ip}`).digest("hex").slice(0, 32);
}

const DB_ERRORS: Record<string, { status: number; message: string }> = {
  P0002: { status: 404, message: "This invitation is no longer available." },
  P0003: { status: 403, message: "RSVPs are not enabled for this invitation." },
  P0004: { status: 410, message: "RSVPs have closed for this event." },
  P0005: { status: 429, message: "Too many responses from your connection. Please try again later." },
};

/** Public RSVP endpoint. All checks happen inside submit_rsvp() in the database. */
export const POST = handle(async (request: NextRequest) => {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) throw new ApiError(413, "Response is too large.", "payload_too_large");

  const body = rsvpSubmissionSchema.parse(await readJson(request));
  if (body.website) {
    // Honeypot tripped: pretend success without storing anything.
    return json({ ok: true, updated: false });
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc("submit_rsvp", {
    p_slug: body.slug,
    p_guest_name: body.guestName,
    p_attendance: body.attendance,
    p_guest_count: body.guestCount,
    p_message: body.message,
    p_dietary_notes: body.dietaryNotes,
    p_contact: body.contact,
    p_ip_hash: hashIp(request),
  });

  if (error) {
    const known = error.code ? DB_ERRORS[error.code] : undefined;
    if (known) return errorResponse(known.status, known.message, error.code);
    console.error("[rsvp] submit failed:", error.code);
    throw new ApiError(500, "We couldn't save your response. Please try again.", "rsvp_failed");
  }

  const result = (data ?? {}) as { id?: string; updated?: boolean };
  return json({ ok: true, updated: Boolean(result.updated) }, 201);
});

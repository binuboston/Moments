import type { NextRequest } from "next/server";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Removes media rows whose upload never completed (older than 24h) and their
 * storage objects if any. Protect with CRON_SECRET (Vercel Cron sends it as a Bearer token).
 */
export async function GET(request: NextRequest) {
  const env = serverEnv();
  const auth = request.headers.get("authorization");
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: stale, error } = await admin.from("invitation_media").select("id, storage_path").eq("is_uploaded", false).lt("created_at", cutoff).limit(500);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (!stale || stale.length === 0) return Response.json({ removed: 0 });

  await admin.storage.from("invitation-media").remove(stale.map((s) => s.storage_path));
  const { error: delError } = await admin.from("invitation_media").delete().in("id", stale.map((s) => s.id));
  if (delError) return Response.json({ error: delError.message }, { status: 500 });
  return Response.json({ removed: stale.length });
}

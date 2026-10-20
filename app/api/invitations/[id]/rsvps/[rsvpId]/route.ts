import type { NextRequest } from "next/server";
import { handle, json, mapDbError, requireUser } from "@/lib/api/respond";
import { uuid } from "@/lib/validation/common";

export const DELETE = handle(async (_req: NextRequest, ctx: RouteContext<"/api/invitations/[id]/rsvps/[rsvpId]">) => {
  const { id, rsvpId } = await ctx.params;
  uuid.parse(id);
  uuid.parse(rsvpId);
  const { supabase } = await requireUser();
  // RLS restricts deletes to invitations the user owns.
  const { error } = await supabase.from("rsvps").delete().eq("id", rsvpId).eq("invitation_id", id);
  if (error) mapDbError(error, "rsvps.delete");
  return json({ ok: true });
});

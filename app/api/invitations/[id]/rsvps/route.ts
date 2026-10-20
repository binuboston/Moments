import type { NextRequest } from "next/server";
import { ApiError, handle, json, mapDbError, requireUser } from "@/lib/api/respond";
import { uuid } from "@/lib/validation/common";
import type { RsvpItem, RsvpSummary } from "@/features/invitations/types";

function csvEscape(value: string | number | null): string {
  const s = value === null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const GET = handle(async (request: NextRequest, ctx: RouteContext<"/api/invitations/[id]/rsvps">) => {
  const { id } = await ctx.params;
  uuid.parse(id);
  const { user, supabase } = await requireUser();
  const { data: inv } = await supabase.from("invitations").select("id, title, slug").eq("id", id).eq("owner_id", user.id).maybeSingle();
  if (!inv) throw new ApiError(404, "Invitation not found.", "not_found");

  const [{ data: rows, error }, { data: summaryRows, error: summaryError }] = await Promise.all([
    supabase.from("rsvps").select("*").eq("invitation_id", id).order("created_at", { ascending: false }).limit(2000),
    supabase.rpc("rsvp_summary", { p_invitation_id: id }),
  ]);
  if (error) mapDbError(error, "rsvps.list");
  if (summaryError) mapDbError(summaryError, "rsvps.summary");

  const items: RsvpItem[] = (rows ?? []).map((r) => ({
    id: r.id,
    guestName: r.guest_name,
    attendance: r.attendance,
    guestCount: r.guest_count,
    message: r.message,
    dietaryNotes: r.dietary_notes,
    contact: r.contact,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
  const s = summaryRows?.[0];
  const summary: RsvpSummary = { total: s?.total ?? 0, yes: s?.yes ?? 0, no: s?.no ?? 0, maybe: s?.maybe ?? 0, guests: s?.guests ?? 0 };

  if (new URL(request.url).searchParams.get("format") === "csv") {
    const header = ["Name", "Attendance", "Guests", "Contact", "Dietary notes", "Message", "Responded at"];
    const lines = items.map((r) => [r.guestName, r.attendance, r.guestCount, r.contact, r.dietaryNotes, r.message, r.updatedAt].map(csvEscape).join(","));
    const csv = [header.join(","), ...lines].join("\r\n");
    return new Response(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="rsvps-${inv.slug}.csv"`,
        "cache-control": "no-store",
      },
    });
  }

  return json({ items, summary });
});

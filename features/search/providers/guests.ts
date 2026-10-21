import "server-only";
import { dbTokens, type SearchProvider } from "@/features/search/provider";
import { scoreFields } from "@/features/search/score";
import { routes } from "@/lib/routes";

const ATTENDANCE: Record<string, string> = { yes: "Coming", no: "Not coming", maybe: "Maybe" };

/** Guests who replied to the owner's invitations, by name (trigram-indexed). Opens that invitation's responses. */
export const guestsProvider: SearchProvider = {
  group: "guests",
  label: "Guests",
  requiresSession: true,
  async search(query, { user, supabase }) {
    if (!user || !supabase || user.isGuest) return [];
    let request = supabase
      .from("rsvps")
      .select("id, guest_name, attendance, guest_count, invitation_id, invitations!inner(title, content, owner_id)")
      .eq("invitations.owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(25);
    for (const token of dbTokens(query)) request = request.ilike("guest_name", `%${token}%`);
    const { data, error } = await request;
    if (error) throw new Error(`guests search: ${error.message}`);
    return (data ?? []).map((row) => {
      const inv = row.invitations as { title: string; content: { headline?: string } | null };
      const invitationTitle = inv.title || inv.content?.headline || "Untitled invitation";
      const party = row.guest_count > 1 ? ` · ${row.guest_count} guests` : "";
      return {
        id: `guest:${row.id}`,
        group: "guests" as const,
        title: row.guest_name,
        subtitle: `${ATTENDANCE[row.attendance] ?? row.attendance}${party} · ${invitationTitle}`,
        href: routes.invitationResponses(row.invitation_id),
        icon: "user" as const,
        score: scoreFields(query, [{ value: row.guest_name, weight: 1 }]) || 30,
      };
    });
  },
};

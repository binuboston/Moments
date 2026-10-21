import "server-only";
import { dbTokens, type SearchProvider } from "@/features/search/provider";
import { scoreFields } from "@/features/search/score";
import { routes } from "@/lib/routes";

const STATUS: Record<string, string> = { draft: "Draft", published: "Published", unpublished: "Unpublished" };

/**
 * The owner's invitations, matched on `search_text` (title, headline, names,
 * venue, slug: maintained by Postgres, trigram-indexed). Drafts without a
 * title are found by the names typed into them.
 */
export const invitationsProvider: SearchProvider = {
  group: "invitations",
  label: "Your invitations",
  requiresSession: true,
  async search(query, { user, supabase }) {
    if (!user || !supabase) return [];
    let request = supabase
      .from("invitations")
      .select("id, title, status, content, event_categories!inner(slug, name)")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(25);
    for (const token of dbTokens(query)) request = request.ilike("search_text", `%${token}%`);
    const { data, error } = await request;
    if (error) throw new Error(`invitations search: ${error.message}`);
    return (data ?? []).map((row) => {
      const content = (row.content ?? {}) as Record<string, string | undefined>;
      const title = row.title || content.headline || "Untitled invitation";
      // Matched by venue or address only: still relevant, ranked below name matches.
      const score =
        scoreFields(query, [
          { value: title, weight: 1 },
          { value: [content.partnerOne, content.partnerTwo, content.celebrantName, content.hostNames, content.parentNames, content.organisation].filter(Boolean).join(" "), weight: 0.9 },
        ]) || 30;
      return {
        id: `invitation:${row.id}`,
        group: "invitations" as const,
        title,
        subtitle: `${STATUS[row.status] ?? row.status} · ${row.event_categories.name}`,
        href: routes.editInvitation(row.id),
        icon: `category:${row.event_categories.slug}` as const,
        score: score + 5,
      };
    });
  },
};

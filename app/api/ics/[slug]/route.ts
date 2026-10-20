import type { NextRequest } from "next/server";
import { slugSchema } from "@/lib/utils/slug";
import { buildIcs } from "@/lib/utils/ics";
import { getPublishedInvitationView } from "@/features/invitations/queries";
import { shareTitle } from "@/features/templates/title";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/ics/[slug]">) {
  const { slug } = await ctx.params;
  if (!slugSchema.safeParse(slug).success) return new Response("Not found", { status: 404 });
  const view = await getPublishedInvitationView(slug);
  if (!view) return new Response("Not found", { status: 404 });

  const { content } = view;
  const ics = buildIcs({
    uid: `${view.id}@mirth`,
    title: shareTitle(content),
    description: [content.intro, view.publicUrl].filter(Boolean).join("\n\n"),
    location: [content.venue.name, content.venue.address].filter(Boolean).join(", ") || undefined,
    url: view.publicUrl,
    startIso: content.startsAt,
    endIso: content.endsAt || undefined,
  });
  return new Response(ics, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}.ics"`,
      "cache-control": "public, max-age=300",
    },
  });
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationRenderer } from "@/features/templates/renderer";
import { getPublishedInvitationView } from "@/features/invitations/queries";
import { formatEventDate } from "@/lib/utils/dates";
import { slugSchema } from "@/lib/utils/slug";
import { truncate } from "@/lib/utils/format";
import { shareTitle } from "@/features/templates/title";
import { BRAND } from "@/lib/brand";
import { routes } from "@/lib/routes";

// Published pages are cached and revalidated on publish/update via revalidatePath.
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/e/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) return { title: "Invitation not found", robots: { index: false, follow: false } };
  const view = await getPublishedInvitationView(slug);
  if (!view) return { title: "Invitation not found", robots: { index: false, follow: false } };

  const { content } = view;
  const date = formatEventDate(content.startsAt, content.timezone);
  const description = truncate(content.intro || content.subheading || `${date}${content.venue.name ? ` · ${content.venue.name}` : ""}`, 160);
  const title = `${shareTitle(content)}${content.subheading ? ` — ${content.subheading}` : ""}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: routes.invitation(slug) },
    // Guest-facing pages are for the people who hold the link, not search engines.
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      title,
      description,
      url: routes.invitation(slug),
      siteName: BRAND.name,
      images: [{ url: routes.invitationImage(slug), width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PublicInvitationPage({ params }: PageProps<"/e/[slug]">) {
  const { slug } = await params;
  if (!slugSchema.safeParse(slug).success) notFound();
  const view = await getPublishedInvitationView(slug);
  if (!view) notFound();

  return (
    <main className="min-h-screen">
      <InvitationRenderer view={view} mode="public" />
    </main>
  );
}

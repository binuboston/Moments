import { ImageResponse } from "next/og";
import { getPublishedInvitationView } from "@/features/invitations/queries";
import { renderInvitationCard } from "@/features/invitations/card-image";

export const alt = "Event invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = await getPublishedInvitationView(slug);

  if (!view) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf7f2", color: "#1c1917", fontSize: 48, fontFamily: "Georgia, serif" }}>
          Invitation not available
        </div>
      ),
      size,
    );
  }

  return renderInvitationCard(view);
}

import { ImageResponse } from "next/og";

export const alt = "Mirth — Beautiful digital invitations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #faf7f2 0%, #f1e6d6 100%)",
          color: "#1c1917",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 44, background: "#8b2e3f", borderRadius: 12 }} />
          <div style={{ fontSize: 40, fontWeight: 600 }}>Mirth</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1.05, fontWeight: 600, letterSpacing: -2 }}>
            <div>Choose a design. Make it yours.</div>
            <div style={{ color: "#8b2e3f" }}>Share your event.</div>
          </div>
          <div style={{ fontSize: 30, color: "#6b6560", fontFamily: "sans-serif" }}>Elegant digital invitations for weddings, birthdays and every celebration.</div>
        </div>
      </div>
    ),
    size,
  );
}

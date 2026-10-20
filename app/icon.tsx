import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Favicon: the brand red disc with the wordmark's initial. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND.colors.primary, borderRadius: 32 }}>
        <div style={{ color: BRAND.colors.paper, fontSize: 40, fontWeight: 700, fontStyle: "italic", fontFamily: "Georgia, serif", marginTop: -2 }}>{BRAND.name[0]}</div>
      </div>
    ),
    size,
  );
}

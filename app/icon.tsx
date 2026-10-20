import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#8b2e3f", borderRadius: 14 }}>
        <svg viewBox="0 0 32 32" width="44" height="44">
          <rect x="2" y="6" width="28" height="22" rx="4" fill="#8b2e3f" />
          <path d="M4 10l12 9 12-9" stroke="#fff8f6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="25" cy="7" r="4" fill="#d4b483" />
        </svg>
      </div>
    ),
    size,
  );
}

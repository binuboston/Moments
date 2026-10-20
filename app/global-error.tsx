"use client";

import { BRAND } from "@/lib/brand";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: BRAND.colors.paper, color: BRAND.colors.ink, margin: 0 }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>Something went wrong</h1>
            <p style={{ color: "#6b6560", marginBottom: "1.5rem" }}>Reference: {error.digest ?? "unknown"}</p>
            <button onClick={reset} style={{ background: BRAND.colors.primary, color: "white", border: 0, borderRadius: 8, padding: "0.75rem 1.25rem", fontSize: "1rem", cursor: "pointer" }}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

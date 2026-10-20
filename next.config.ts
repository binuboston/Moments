import type { NextConfig } from "next";
import path from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  // The default scaffold enables cacheComponents. This app uses the previous
  // caching model (segment `revalidate` + revalidatePath on publish) because the
  // dashboard is request-time by nature. See docs/ARCHITECTURE.md §1.
  cacheComponents: false,
  reactCompiler: true,
  poweredByHeader: false,
  images: {
    qualities: [60, 75, 90],
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: supabaseHost === "127.0.0.1" || supabaseHost === "localhost" ? ("http" as const) : ("https" as const),
              hostname: supabaseHost,
              pathname: "/storage/v1/object/**",
            },
          ]
        : []),
    ],
    // Local Supabase runs on 127.0.0.1; allow it only when explicitly in development.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
  turbopack: {
    // Keep Turbopack scoped to this project even when a parent folder has a lockfile.
    root: path.join(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The app moved from /dashboard to the root; keep old links (and bookmarks) working.
  async redirects() {
    return [
      { source: "/dashboard", destination: "/", permanent: true },
      { source: "/dashboard/:path*", destination: "/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

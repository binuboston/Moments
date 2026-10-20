import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/templates", "/pricing", "/how-it-works", "/help"],
        // Invitations are for guests, not search engines. Dashboards are private.
        disallow: ["/demo/", "/dashboard", "/admin", "/api", "/e/", "/login", "/signup", "/forgot-password", "/reset-password", "/auth"],
      },
    ],
    sitemap: siteUrl("/sitemap.xml"),
  };
}

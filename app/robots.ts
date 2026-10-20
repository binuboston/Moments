import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { ROUTES } from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [ROUTES.home, ROUTES.templates, ROUTES.pricing, ROUTES.howItWorks, ROUTES.help],
        // Invitations are for guests, not search engines. Dashboards are private.
        disallow: [ROUTES.demos, ROUTES.app, ROUTES.admin, "/api", ROUTES.publicInvitations, ROUTES.login, ROUTES.signup, ROUTES.forgotPassword, ROUTES.resetPassword, ROUTES.authCallback, ROUTES.signOut],
      },
    ],
    sitemap: siteUrl("/sitemap.xml"),
  };
}

import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { ROUTES } from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [ROUTES.home, ROUTES.about, ROUTES.templates, ROUTES.pricing, ROUTES.howItWorks, ROUTES.help],
        // Invitations are for guests, not search engines. Personal pages are private.
        // (Never list ROUTES.app here: the app is the index, "/".)
        disallow: [ROUTES.demos, ROUTES.search, ROUTES.invitations, ROUTES.settings, ROUTES.start, ROUTES.admin, "/api", ROUTES.publicInvitations, ROUTES.login, ROUTES.signup, ROUTES.forgotPassword, ROUTES.resetPassword, ROUTES.authCallback, ROUTES.signOut],
      },
    ],
    sitemap: siteUrl("/sitemap.xml"),
  };
}

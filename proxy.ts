import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip static assets, images, public invitation pages and their OG images.
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|e/|api/rsvp|api/og|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|woff2?)$).*)",
  ],
};

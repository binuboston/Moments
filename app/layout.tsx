import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { publicEnv } from "@/lib/env";
import { PRE_PAINT_SCRIPT } from "@/lib/motion/pre-paint";
import { BRAND } from "@/lib/brand";

/** Product typeface: a variable grotesk used for UI and display type (weights 100–900). */
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

/** Template-only faces (invitation designs reference them via features/templates/fonts.ts). */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  axes: ["opsz"],
  preload: false,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv().NEXT_PUBLIC_SITE_URL),
  title: {
    default: BRAND.title,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Choose a design, make it yours and share your event with the world. Elegant digital invitations for weddings, birthdays, showers and more.",
  applicationName: BRAND.name,
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: BRAND.title,
    description: "Choose a design. Make it yours. Share your event with the world.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
  // Lets layouts pad for the iPhone home indicator via env(safe-area-inset-*).
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the pre-paint script adds a class to <html> before React hydrates.
    <html lang="en" className={`${geist.variable} ${dmSans.variable} ${fraunces.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

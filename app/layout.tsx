import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";
import { publicEnv } from "@/lib/env";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  axes: ["opsz"],
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv().NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Mirth — Beautiful digital invitations",
    template: "%s · Mirth",
  },
  description:
    "Choose a design, make it yours and share your event with the world. Elegant digital invitations for weddings, birthdays, showers and more.",
  applicationName: "Mirth",
  openGraph: {
    type: "website",
    siteName: "Mirth",
    title: "Mirth — Beautiful digital invitations",
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
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

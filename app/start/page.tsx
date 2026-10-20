import type { Metadata } from "next";
import { Suspense } from "react";
import { GuestStart } from "@/features/auth/guest-start";

export const metadata: Metadata = { title: "Start creating", robots: { index: false, follow: false } };

/** Entry point for creating without an account (the proxy sends signed-out visitors here). */
export default function StartPage() {
  return (
    <Suspense>
      <GuestStart />
    </Suspense>
  );
}

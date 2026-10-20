"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep logs free of user content; the digest lets us correlate with server logs.
    console.error("[app error]", error.digest ?? error.message);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">We hit a snag loading this page</h1>
      <p className="mt-4 max-w-md text-muted-foreground text-pretty">Please try again. If the problem continues, contact support and mention this code: {error.digest ?? "unknown"}.</p>
      <Button className="mt-8" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}

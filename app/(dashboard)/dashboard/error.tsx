"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[dashboard error]", error.digest ?? error.message);
  }, [error]);

  return (
    <EmptyState
      title="Something went wrong"
      description={`We couldn't load this page. Please try again. Reference: ${error.digest ?? "unknown"}.`}
      action={<Button onClick={reset}>Try again</Button>}
    />
  );
}

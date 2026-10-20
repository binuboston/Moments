"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tooltip } from "radix-ui";
import { useState } from "react";
import { Toaster } from "sonner";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: { retry: 0 },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // One client per browser session; never share across requests on the server.
  const [queryClient] = useState(makeQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <Tooltip.Provider delayDuration={200}>{children}</Tooltip.Provider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast: "!rounded-xl !border-border !bg-surface !text-foreground !shadow-lift",
            description: "!text-muted-foreground",
          },
        }}
      />
    </QueryClientProvider>
  );
}

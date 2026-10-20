"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tooltip } from "radix-ui";
import { useState } from "react";
import { Toaster } from "sonner";
import { NavigationProgress } from "@/components/motion/navigation-progress";

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
      <NavigationProgress />
      <Tooltip.Provider delayDuration={200}>{children}</Tooltip.Provider>
      <Toaster
        position="bottom-center"
        // Keep toasts clear of the mobile bottom navigation and the home indicator.
        mobileOffset={{ bottom: "calc(5.5rem + env(safe-area-inset-bottom))" }}
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

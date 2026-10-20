"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tooltip } from "radix-ui";
import { useState } from "react";
import { Toaster } from "sonner";
import { NavigationProgress } from "@/components/motion/navigation-progress";
import { AccountProvider } from "@/features/auth/account-context";

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
      {/* Resolves the signed-in account lazily, only on pages that show account UI. */}
      <AccountProvider>
        <Tooltip.Provider delayDuration={200}>{children}</Tooltip.Provider>
      </AccountProvider>
      <Toaster
        // Top: bottom bars (editor) own the bottom edge; clear the floating header.
        position="top-center"
        offset={{ top: "5.5rem" }}
        mobileOffset={{ top: "5rem" }}
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

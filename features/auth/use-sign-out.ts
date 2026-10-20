"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ROUTES } from "@/lib/routes";

/** Server route that clears the Supabase session cookies (app/auth/signout/route.ts). */
export const SIGN_OUT_ENDPOINT = ROUTES.signOut;

/**
 * The single sign-out implementation for every UI entry point (account menu,
 * settings). Works inside menus that unmount on select, unlike a <form>.
 */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const signOut = useCallback(async () => {
    setPending(true);
    try {
      await fetch(SIGN_OUT_ENDPOINT, { method: "POST", credentials: "same-origin" });
    } finally {
      // Drop cached private data, then re-render server components without the session.
      queryClient.clear();
      router.replace(ROUTES.home);
      router.refresh();
    }
  }, [queryClient, router]);

  return { signOut, pending };
}

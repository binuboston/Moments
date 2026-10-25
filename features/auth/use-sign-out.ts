"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";

/** Server route that clears the Supabase session cookies (app/auth/signout/route.ts). */
export const SIGN_OUT_ENDPOINT = ROUTES.signOut;

/**
 * The single sign-out implementation for every UI entry point (account menu,
 * settings). Works inside menus that unmount on select, unlike a <form>.
 * `everywhere` revokes every session for the account (suspected compromise);
 * the default signs out this device only.
 */
export function useSignOut({ everywhere = false }: { everywhere?: boolean } = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const signOut = useCallback(async () => {
    setPending(true);
    try {
      const res = await fetch(everywhere ? `${SIGN_OUT_ENDPOINT}?scope=global` : SIGN_OUT_ENDPOINT, { method: "POST", credentials: "same-origin" });
      // This device is signed out either way; say so if the other devices could not be.
      if (!res.ok) toast.error("We couldn't sign out your other devices. Log in and try again.");
    } finally {
      // Drop cached private data, then re-render server components without the session.
      queryClient.clear();
      router.replace(ROUTES.home);
      router.refresh();
    }
  }, [everywhere, queryClient, router]);

  return { signOut, pending };
}

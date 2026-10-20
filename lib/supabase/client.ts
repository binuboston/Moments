"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Browser Supabase client (anon key + user session from cookies). Singleton per tab. */
export function createClient() {
  if (browserClient) return browserClient;
  const env = publicEnv();
  browserClient = createBrowserClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return browserClient;
}

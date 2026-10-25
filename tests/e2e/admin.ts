import { createClient } from "@supabase/supabase-js";

/** Service-role client for test setup only (local Supabase; never in app code paths). */
export const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

/** Creates an unconfirmed email account and returns its one-time confirmation token hash. */
export async function unconfirmedAccount(email: string, password: string): Promise<string> {
  const { data, error } = await admin.auth.admin.generateLink({ type: "signup", email, password });
  if (error) throw error;
  return data.properties.hashed_token;
}

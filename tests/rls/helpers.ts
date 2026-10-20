import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type Client = SupabaseClient<Database>;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const admin: Client = createClient<Database>(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

export function anonClient(): Client {
  return createClient<Database>(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface TestUser {
  id: string;
  email: string;
  password: string;
  client: Client;
}

export async function createUser(label: string, opts: { role?: "user" | "admin"; plan?: "free" | "pro" } = {}): Promise<TestUser> {
  const email = `rls-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.test`;
  const password = "Passw0rd!RLS-test";
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: `RLS ${label}` } });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message}`);
  if (opts.role || opts.plan) {
    const { error: upErr } = await admin.from("profiles").update({ role: opts.role ?? "user", plan: opts.plan ?? "free" }).eq("id", data.user.id);
    if (upErr) throw new Error(`profile update failed: ${upErr.message}`);
  }
  const client = anonClient();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`signIn failed: ${signInError.message}`);
  return { id: data.user.id, email, password, client };
}

export async function deleteUser(user: TestUser) {
  await admin.auth.admin.deleteUser(user.id);
}

export async function catalogue() {
  const [{ data: template }, { data: category }] = await Promise.all([
    admin.from("templates").select("id, slug").eq("slug", "modern-minimal").single(),
    admin.from("event_categories").select("id, slug").eq("slug", "party").single(),
  ]);
  if (!template || !category) throw new Error("Catalogue rows missing; run pnpm db:reset");
  return { templateId: template.id, categoryId: category.id };
}

export function sampleContent() {
  return {
    kind: "party",
    headline: "RLS Test Party",
    subheading: "",
    intro: "",
    hosts: "",
    message: "",
    startsAt: "2030-06-20T18:00:00+01:00",
    endsAt: "",
    timezone: "Europe/London",
    venue: { name: "Test venue", address: "", mapsUrl: "" },
    contacts: [],
    gifts: { note: "", url: "" },
    dressCode: "",
    hostNames: "",
    occasion: "",
  };
}

export const uniqueSlug = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

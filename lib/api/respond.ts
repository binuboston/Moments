import "server-only";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function json<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

export function errorResponse(status: number, message: string, code?: string, details?: unknown) {
  return NextResponse.json({ error: message, code, details }, { status });
}

/** Wraps a route handler, converting thrown ApiError/ZodError into JSON responses. */
export function handle<Args extends unknown[]>(fn: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ApiError) return errorResponse(err.status, err.message, err.code, err.details);
      if (err instanceof ZodError) {
        return errorResponse(400, "Please check the highlighted fields.", "validation_error", err.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
      }
      console.error("[api] unhandled error", err instanceof Error ? err.message : err);
      return errorResponse(500, "Something went wrong. Please try again.", "internal_error");
    }
  };
}

/** Returns the authenticated user and a session-bound client, or throws 401. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "You need to be logged in.", "unauthenticated");
  const supabase = await createClient();
  return { user, supabase };
}

/** Requires an admin profile. Relies on RLS as the second line of defence. */
export async function requireAdmin() {
  const { user, supabase } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new ApiError(403, "Administrator access required.", "forbidden");
  return { user, supabase };
}

export async function readJson<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.", "invalid_json");
  }
}

/** Translates common Postgres error codes to API errors. */
export function mapDbError(error: { code?: string; message: string }, context: string): never {
  if (error.code === "23505") throw new ApiError(409, "That value is already taken.", "conflict");
  if (error.code === "23514") throw new ApiError(400, "A value failed validation.", "constraint_violation");
  if (error.code === "42501") throw new ApiError(403, "You don't have permission to do that.", "forbidden");
  if (error.code === "PGRST116") throw new ApiError(404, "Not found.", "not_found");
  console.error(`[db] ${context}:`, error.code, error.message);
  throw new ApiError(500, "Database error.", "db_error");
}

import { createClient } from "@supabase/supabase-js";
import { expect, test, type BrowserContext } from "@playwright/test";
import { signUp } from "./helpers";

/** A session the server no longer accepts (deleted or revoked user) must never trap the visitor. */
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

async function currentUserId(context: BrowserContext): Promise<string> {
  const cookie = (await context.cookies()).find((c) => c.name.includes("auth-token") && !c.name.endsWith("code-verifier"));
  const raw = decodeURIComponent(cookie!.value).replace(/^base64-/, "");
  const session = JSON.parse(Buffer.from(raw, "base64").toString()) as { access_token: string };
  return JSON.parse(Buffer.from(session.access_token.split(".")[1], "base64url").toString()).sub as string;
}

test("a deleted guest session is replaced by a fresh guest, without a loop", async ({ page, context }) => {
  await page.goto("/invitations");
  await expect(page).toHaveURL(/\/invitations$/, { timeout: 30_000 });
  const first = await currentUserId(context);
  await admin.auth.admin.deleteUser(first);

  await page.goto("/invitations");
  await expect(page).toHaveURL(/\/invitations$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await currentUserId(context)).not.toBe(first);
});

test("a revoked account session asks the person to log in again", async ({ page, context }) => {
  await signUp(page, "revoked");
  const id = await currentUserId(context);
  await admin.auth.admin.deleteUser(id);

  await page.goto("/invitations");
  await expect(page).toHaveURL(/\/login\?next=%2Finvitations&error=expired/, { timeout: 30_000 });
  await expect(page.getByText(/your session has expired/i)).toBeVisible();
});

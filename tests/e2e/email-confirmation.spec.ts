import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { unconfirmedAccount } from "./admin";
import { emailLink, PASSWORD, uniqueEmail } from "./helpers";

/**
 * Email confirmation via /auth/confirm (token hash): works on any device,
 * keeps the destination (the wizard, with the chosen design and its draft
 * key), creates exactly one draft and rejects used links.
 */
const confirmUrl = (hash: string, next?: string) => {
  const q = new URLSearchParams({ token_hash: hash, type: "signup" });
  if (next) q.set("next", next);
  return `/auth/confirm?${q}`;
};

test("confirming on another device continues with the chosen design, once; the link is single-use", async ({ browser }) => {
  const hash = await unconfirmedAccount(uniqueEmail("confirm"), PASSWORD);
  const wizard = `/create?category=birthday&template=balloon-bash&key=${randomUUID()}`;

  // A different browser from the one that signed up.
  const other = await (await browser.newContext()).newPage();
  await other.goto(confirmUrl(hash, wizard));
  await other.waitForURL(/\/invitations\/[0-9a-f-]{36}\/edit/, { timeout: 30_000 });
  const id = other.url().match(/invitations\/([0-9a-f-]{36})\/edit/)![1];
  const draft = (await (await other.request.get(`/api/invitations/${id}`)).json()) as { templateKey: string };
  expect(draft.templateKey).toBe("balloon-bash");

  // Opening the wizard link again (refresh, Back, a second click) reopens the same draft.
  await other.goto(wizard);
  await other.waitForURL(new RegExp(`/invitations/${id}/edit`), { timeout: 30_000 });
  const list = (await (await other.request.get("/api/invitations")).json()) as { total: number };
  expect(list.total).toBe(1);

  const again = await (await browser.newContext()).newPage();
  await again.goto(confirmUrl(hash, wizard));
  await expect(again).toHaveURL(/\/login\?error=link/);
});

test("interrupted sign-up: an unconfirmed account cannot log in, can resend, and the new link works on any device", async ({ browser, page }) => {
  const email = uniqueEmail("pending");
  await unconfirmedAccount(email, PASSWORD);
  // generateLink counts as a send: Supabase refuses another to the same address within max_frequency (1s locally).
  await page.waitForTimeout(1500);

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /confirm your email/i })).toBeVisible();

  const sentAt = Date.now() - 1000;
  const resend = page.getByTestId("resend-confirmation");
  await resend.getByRole("button", { name: "Resend confirmation email" }).click();
  await expect(resend.getByText(/a new link is on its way/i)).toBeVisible();
  await expect(resend.getByRole("button", { name: /Resend email \(\d+s\)/ })).toBeDisabled();

  const link = await emailLink(email, /\/auth\/confirm\?/, { after: sentAt });
  expect(link).toMatch(/token_hash=.+&type=email/);
  const other = await (await browser.newContext()).newPage();
  await other.goto(link);
  await expect(other).toHaveURL((u) => u.pathname === "/", { timeout: 30_000 });
});

test("resend gives the same answer for an unknown address", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(uniqueEmail("nobody"));
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  // Unknown addresses fail as bad credentials, so no resend prompt reveals anything.
  await expect(page.getByRole("alert").filter({ hasText: /don't match/i })).toBeVisible();
  await expect(page.getByTestId("resend-confirmation")).toHaveCount(0);
});

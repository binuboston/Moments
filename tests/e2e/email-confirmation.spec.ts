import { expect, test, type Page } from "@playwright/test";
import { unconfirmedAccount } from "./admin";
import { createInvitation, emailLink, PASSWORD, uniqueEmail, waitForDraft } from "./helpers";

/**
 * Email confirmation via /auth/confirm (token hash): works on any device,
 * keeps the destination, rejects used links, and brings a guest's drafts
 * along when confirmed in the guest's browser.
 */
const confirmUrl = (hash: string, next?: string) => {
  const q = new URLSearchParams({ token_hash: hash, type: "signup" });
  if (next) q.set("next", next);
  return `/auth/confirm?${q}`;
};

async function guestDraft(page: Page) {
  const id = await createInvitation(page, "birthday", "balloon-bash");
  await page.getByLabel("Who's celebrating?").fill("Zoe");
  await waitForDraft(page, id, (d) => (d.content as { celebrantName?: string }).celebrantName, "Zoe");
  return id;
}

test("confirming in the guest's browser signs in, keeps the destination and brings the draft; the link is single-use", async ({ browser, page }) => {
  const id = await guestDraft(page);
  const hash = await unconfirmedAccount(uniqueEmail("confirm"), PASSWORD);

  await page.goto(confirmUrl(hash, `/invitations/${id}/edit`));
  await expect(page).toHaveURL(new RegExp(`/invitations/${id}/edit$`), { timeout: 30_000 });
  expect((await page.request.get(`/api/invitations/${id}`)).status()).toBe(200);
  const list = (await (await page.request.get("/api/invitations")).json()) as { total: number };
  expect(list.total).toBe(1);

  const again = await (await browser.newContext()).newPage();
  await again.goto(confirmUrl(hash, "/invitations"));
  await expect(again).toHaveURL(/\/login\?error=link/);
});

test("confirming on another device signs in there; the guest's drafts stay with the guest", async ({ browser, page }) => {
  const id = await guestDraft(page);
  const hash = await unconfirmedAccount(uniqueEmail("other-device"), PASSWORD);

  const other = await (await browser.newContext()).newPage();
  await other.goto(`${confirmUrl(hash, "/invitations")}&invitation=${id}`);
  await expect(other).toHaveURL(/\/invitations$/, { timeout: 30_000 });
  // Never moved because of a client-supplied id.
  expect((await other.request.get(`/api/invitations/${id}`)).status()).toBe(404);
  expect((await page.request.get(`/api/invitations/${id}`)).status()).toBe(200);
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

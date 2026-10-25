import { expect, test } from "@playwright/test";
import { emailLink, logIn, PASSWORD, signUp } from "./helpers";

/**
 * Password recovery: the emailed link works on any device and only once, the
 * password changes, and every other session is signed out.
 */
test.describe.configure({ mode: "serial" });

const NEW_PASSWORD = "N3w-passw0rd!recovered";

async function requestReset(page: import("@playwright/test").Page, email: string) {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText("Check your inbox")).toBeVisible();
}

test("reset on another device: link works once, password changes, other sessions are signed out", async ({ browser, page }) => {
  // Device A: signed in normally (this session must be revoked by the reset).
  const { email } = await signUp(page, "recover");
  expect((await page.request.get("/api/invitations")).status()).toBe(200);

  // Device B (separate browser, no shared cookies): requests the reset.
  const deviceB = await browser.newContext();
  const b = await deviceB.newPage();
  const sentAt = Date.now() - 1000;
  await requestReset(b, email);
  const link = await emailLink(email, /\/auth\/confirm\?/, { after: sentAt });
  expect(link).toMatch(/token_hash=/);
  expect(link).toMatch(/type=recovery/);

  // Device C (a third browser) opens the link: token-hash links do not need the requesting browser.
  const deviceC = await browser.newContext();
  const c = await deviceC.newPage();
  await c.goto(link);
  await expect(c).toHaveURL(/\/reset-password$/);
  await c.getByLabel("New password").fill(NEW_PASSWORD);
  await c.getByLabel("Confirm password").fill(NEW_PASSWORD);
  await c.getByTestId("update-password").click();
  await expect(c).toHaveURL((u) => u.pathname === "/", { timeout: 15_000 });

  // The same link cannot be used twice.
  const reuse = await (await browser.newContext()).newPage();
  await reuse.goto(link);
  await expect(reuse).toHaveURL(/\/forgot-password\?error=link/);

  // Device A's earlier session was revoked.
  await expect.poll(async () => (await page.request.get("/api/invitations")).status(), { timeout: 15_000 }).toBe(401);

  // Old password no longer works; the new one does.
  const fresh = await (await browser.newContext()).newPage();
  await fresh.goto("/login");
  await fresh.getByLabel("Email").fill(email);
  await fresh.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await fresh.getByRole("button", { name: "Log in" }).click();
  await expect(fresh.getByRole("alert").filter({ hasText: /don't match/i })).toBeVisible();
  await logIn(fresh, email, NEW_PASSWORD);
  await deviceB.close();
  await deviceC.close();
});

test("forged, truncated and wrong-type links are rejected", async ({ page }) => {
  for (const q of ["token_hash=deadbeef&type=recovery", "token_hash=&type=recovery", "token_hash=abc&type=magic", "type=recovery", "token_hash=abc&type=recovery&next=%2F%09%2Fevil.example"]) {
    await page.goto(`/auth/confirm?${q}`);
    expect(new URL(page.url()).pathname, q).toMatch(/^\/(forgot-password|login)$/);
    expect(page.url()).toContain("error=link");
  }
});

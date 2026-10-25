import { expect, test } from "@playwright/test";
import { emailLink, logIn, logOut, signUp } from "./helpers";

/**
 * Session revocation policy (docs/AUTH.md): ordinary logout ends this device's
 * session only; "Log out everywhere" revokes every session; a password reset
 * revokes the others (covered in password-recovery.spec.ts).
 */
test.describe.configure({ mode: "serial" });

const status = async (page: import("@playwright/test").Page) => (await page.request.get("/api/invitations")).status();

test("log out ends this device only; log out everywhere ends them all", async ({ browser, page }) => {
  const { email } = await signUp(page, "sessions");
  const b = await (await browser.newContext()).newPage();
  const c = await (await browser.newContext()).newPage();
  await logIn(b, email);
  await logIn(c, email);

  // Device A logs out: A is signed out, B and C are not.
  await logOut(page);
  expect(await status(page)).toBe(401);
  expect(await status(b)).toBe(200);
  expect(await status(c)).toBe(200);

  // Device B suspects a compromise: every session ends, including C's.
  await b.goto("/settings");
  await b.getByTestId("logout-everywhere").click();
  await b.waitForURL((u) => u.pathname === "/");
  expect(await status(b)).toBe(401);
  await expect.poll(() => status(c), { timeout: 15_000 }).toBe(401);
  // C no longer has the account: like any signed-out visitor, the app gives it a fresh guest studio.
  await c.goto("/settings");
  await expect(c.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(c.getByText(email)).toHaveCount(0);
});

test("the settings reset email uses the any-device recovery link", async ({ page }) => {
  const { email } = await signUp(page, "settings-reset");
  await page.goto("/settings");
  const sentAt = Date.now() - 1000;
  await page.getByRole("button", { name: "Send password reset email" }).click();
  await expect(page.getByText(/reset link sent/i)).toBeVisible();
  const link = await emailLink(email, /\/auth\/confirm\?/, { after: sentAt });
  expect(link).toMatch(/type=recovery/);
  const other = await (await page.context().browser()!.newContext()).newPage();
  await other.goto(link);
  await expect(other).toHaveURL(/\/reset-password$/);
});

import { expect, test } from "@playwright/test";
import { logOut, PASSWORD, signUp } from "./helpers";

/**
 * Regression: "next" values must never take the browser off-site. Each case
 * goes through a real caller of safeNextPath. %09 / %0A decode to a tab /
 * newline, which browsers strip from URLs ("/\t/evil.com" -> "//evil.com").
 */
const ESCAPES = ["%2F%09%2Fevil.example", "%2F%0A%2Fevil.example", "%2F%2Fevil.example", "%2F%5Cevil.example", "https%3A%2F%2Fevil.example"];

const onSite = (page: import("@playwright/test").Page, baseURL?: string) => new URL(page.url()).origin === new URL(baseURL!).origin;

test("/start never forwards off-site", async ({ page, baseURL }) => {
  for (const next of ESCAPES) {
    await page.goto(`/start?next=${next}`);
    await page.waitForURL((u) => u.pathname !== "/start", { timeout: 30_000 });
    expect(onSite(page, baseURL), `${next} -> ${page.url()}`).toBe(true);
  }
});

test("/start still forwards to a valid internal page", async ({ page }) => {
  await page.goto(`/start?next=${encodeURIComponent("/invitations/new?category=wedding")}`);
  await expect(page).toHaveURL(/\/invitations\/new\?category=wedding$/, { timeout: 30_000 });
});

test("logging in never forwards off-site, and still honours an internal next", async ({ page, baseURL }) => {
  const { email } = await signUp(page, "redirect");
  await logOut(page);
  await page.goto(`/login?next=${ESCAPES[0]}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL((u) => u.pathname !== "/login", { timeout: 30_000 });
  expect(onSite(page, baseURL)).toBe(true);
  expect(new URL(page.url()).pathname).toBe("/");

  await logOut(page);
  await page.goto(`/login?next=${encodeURIComponent("/invitations")}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/invitations$/, { timeout: 30_000 });
});

test("the auth callback never forwards off-site", async ({ page, baseURL }) => {
  for (const next of ESCAPES) {
    // An invalid code: the callback must send us to its own error page, never to "next".
    await page.goto(`/auth/callback?code=not-a-real-code&next=${next}`);
    expect(onSite(page, baseURL), `${next} -> ${page.url()}`).toBe(true);
    await expect(page).toHaveURL(/\/login\?error=auth/);
  }
});

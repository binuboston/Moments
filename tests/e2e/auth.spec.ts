import { expect, test } from "@playwright/test";
import { logIn, logOut, signUp } from "./helpers";

test.describe("authentication", () => {
  test("protected routes redirect to login with a return path", async ({ page }) => {
    await page.goto("/dashboard/invitations");
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Finvitations/);
    const api = await page.request.get("/api/invitations");
    expect(api.status()).toBe(401);
  });

  test("sign up, log out and log back in", async ({ page }) => {
    const { email } = await signUp(page, "auth");
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await logOut(page);
    await expect(page).toHaveURL(/\/$/);
    await logIn(page, email);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    // Logged-in users are bounced away from auth pages.
    await page.goto("/login");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("invalid credentials show a friendly error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nobody@example.test");
    await page.getByLabel("Password", { exact: true }).fill("wrong-password-123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /couldn't log in/i })).toContainText(/don't match/i);
  });
});

test.describe("account menu", () => {
  test("logs out from the dashboard account dropdown", async ({ page }) => {
    await signUp(page, "menu-logout");
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: /log out/i }).click();
    await page.waitForURL((url) => url.pathname === "/", { timeout: 15_000 });
    // The session is really gone: protected pages redirect to login again.
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

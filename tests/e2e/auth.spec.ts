import { expect, test } from "@playwright/test";
import { logIn, logOut, openAccount, signUp } from "./helpers";

test.describe("authentication", () => {
  test("signed-out visitors open the app as guests; admin and the API still need a session", async ({ page, playwright, baseURL }) => {
    await page.goto("/invitations");
    await expect(page).toHaveURL(/\/invitations$/, { timeout: 30_000 });

    // The logo always goes to the landing page.
    await page.getByRole("link", { name: "Invite home" }).first().click();
    await expect(page).toHaveURL(/\/$/);

    // Without any session the API refuses and admin asks for a real login.
    const anonymous = await playwright.request.newContext({ baseURL });
    expect((await anonymous.get("/api/invitations")).status()).toBe(401);
    await anonymous.dispose();
    await page.context().clearCookies();
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin/);
  });

  test("sign up, log out and log back in", async ({ page, isMobile }) => {
    const signedIn = async () => {
      const account = await openAccount(page, isMobile);
      await expect(isMobile ? account.getByTestId("mobile-account") : account.getByRole("menuitem", { name: /log out/i })).toBeVisible();
      await page.keyboard.press("Escape");
    };
    const { email } = await signUp(page, "auth");
    await signedIn();
    await logOut(page);
    await expect(page).toHaveURL(/\/$/);
    await logIn(page, email);
    await signedIn();
    // Logged-in users are bounced away from auth pages.
    await page.goto("/login");
    await expect(page).toHaveURL((url) => url.pathname === "/");
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
  test("logs out from the account menu", async ({ page, isMobile }) => {
    await signUp(page, "menu-logout");
    const account = await openAccount(page, isMobile);
    if (isMobile) await account.getByTestId("mobile-account-signOut").click();
    else await account.getByRole("menuitem", { name: /log out/i }).click();
    await page.waitForURL((url) => url.pathname === "/", { timeout: 15_000 });
    // The account session is really gone: Log in is offered, and creating starts a fresh guest.
    if (isMobile) {
      await expect((await openAccount(page, true)).getByTestId("mobile-account-login")).toBeVisible();
      await page.keyboard.press("Escape");
    } else {
      await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    }
    await page.goto("/invitations");
    await expect(page).toHaveURL(/\/invitations$/, { timeout: 30_000 });
    await expect((await openAccount(page, isMobile)).getByText("Guest", { exact: true })).toBeVisible();
  });
});

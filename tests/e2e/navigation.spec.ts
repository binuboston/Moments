import { expect, test, type Page } from "@playwright/test";
import { signUp } from "./helpers";

/**
 * The header and menus for every account state, on desktop and phone
 * (Playwright projects), entering the app by clicking like a person does.
 */

async function openAccountUi(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  else await page.getByRole("button", { name: "Account menu" }).click();
}

test("signed out: home works without an account; Invitations starts a guest session", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByTestId("mobile-signed-out");
    await expect(menu.getByTestId("mobile-account-start")).toBeVisible();
    await expect(menu.getByTestId("mobile-account-login")).toBeVisible();
    await page.getByRole("button", { name: "Close menu" }).click();
  } else {
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Account menu" })).toHaveCount(0);
  }
  // Home (the index) needs no session; the rail / tab bar take you into the app.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Invitations" }).click();
  await expect(page).toHaveURL(/\/invitations$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("guest: the same options in the account menu and the phone menu", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Create" }).click();
  await expect(page).toHaveURL(/\/invitations\/new$/, { timeout: 30_000 });

  // Wider screens: the account menu in the top bar.
  if (!isMobile) {
    await page.getByRole("button", { name: "Account menu" }).click();
    const menu = page.getByRole("menu");
    await expect(menu.getByText("Guest", { exact: true })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /create free account/i })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /log in/i })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /log out/i })).toHaveCount(0);
    await page.keyboard.press("Escape");
  }

  // Phones: the account lives in the tab bar's Menu (the top bar has none).
  if (isMobile) {
    await expect(page.getByRole("button", { name: "Account menu" })).toHaveCount(0);
    await page.getByRole("button", { name: "Open menu" }).click();
    const sheet = page.getByTestId("mobile-guest");
    await expect(sheet.getByText("Guest", { exact: true })).toBeVisible();
    await expect(sheet.getByTestId("mobile-account-signup")).toBeVisible();
    await expect(sheet.getByTestId("mobile-account-login")).toBeVisible();
    await expect(sheet.getByTestId("mobile-account-signOut")).toHaveCount(0);
  }
});

test("account holder: settings and log out in both menus", async ({ page, isMobile }) => {
  await signUp(page, "nav");
  await openAccountUi(page, isMobile);
  if (isMobile) {
    const menu = page.getByTestId("mobile-account");
    await expect(menu.getByTestId("mobile-account-settings")).toBeVisible();
    await expect(menu.getByTestId("mobile-account-signOut")).toBeVisible();
  } else {
    const menu = page.getByRole("menu");
    await expect(menu.getByRole("menuitem", { name: /settings/i })).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: /log out/i })).toBeVisible();
  }
});

test("phones keep the tab bar on the Create screen, with the wizard's action docked above it", async ({ page, isMobile }) => {
  test.skip(!isMobile, "The tab bar is a phone pattern");
  await page.goto("/invitations/new");
  await expect(page).toHaveURL(/\/invitations\/new/, { timeout: 30_000 });
  const create = page.getByTestId("tab-create");
  await expect(create).toBeVisible();
  await expect(create).toHaveAttribute("aria-current", "page");

  await page.getByTestId("category-birthday").click();
  const cont = page.getByTestId("create-invitation");
  await expect(cont).toBeVisible();
  const [bar, tabs] = await Promise.all([cont.boundingBox(), page.getByRole("navigation", { name: "Primary" }).boundingBox()]);
  expect(bar!.y + bar!.height).toBeLessThanOrEqual(tabs!.y + 1);

  // The editor still replaces the tabs with its own bar.
  await page.getByTestId("template-balloon-bash").click();
  await cont.click();
  await page.waitForURL(/\/edit/, { timeout: 30_000 });
  await expect(page.getByTestId("tab-create")).toHaveCount(0);
  await expect(page.getByTestId("editor-bar")).toBeVisible();
});

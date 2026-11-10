import { expect, test, type Page } from "@playwright/test";
import { chooseOccasion, signUp } from "./helpers";

/**
 * The header and menus for every account state, on desktop and phone
 * (Playwright projects), entering the app by clicking like a person does.
 */

async function openAccountUi(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
  else await page.getByRole("button", { name: "Account menu" }).click();
}

test("signed out: Home is the Create flow, with no duplicate tabs (only Log in on phones)", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    const menu = page.getByTestId("mobile-signed-out");
    await expect(menu.getByTestId("mobile-account-start")).toBeVisible();
    await expect(menu.getByTestId("mobile-account-login")).toBeVisible();
    await expect(menu).not.toContainText(/guest/i);
    await page.getByRole("button", { name: "Close menu" }).click();
  } else {
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Account menu" })).toHaveCount(0);
  }
  // Home (the index) is the Create flow for visitors, so there is no Home or Create tab; phones get Log in.
  const primary = page.getByRole("navigation", { name: "Primary" });
  await expect(page.getByTestId("template-eternal-grace")).toBeVisible();
  for (const name of ["Home", "Create", "Invitations"]) await expect(primary.getByRole("link", { name })).toHaveCount(0);
  if (isMobile) await expect(primary.getByRole("link", { name: "Log in" })).toBeVisible();
  // The flow has one address for visitors: /create brings them back to Home, keeping the choice.
  await page.goto("/create?category=wedding");
  await expect(page).toHaveURL(/\/\?category=wedding$/, { timeout: 30_000 });
  await expect(page.getByTestId("template-eternal-grace")).toBeVisible();
  // Your invitations still need an account: the address asks to log in, then comes back.
  await page.goto("/invitations");
  await expect(page).toHaveURL(/\/login\?next=%2Finvitations$/, { timeout: 30_000 });
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
  await signUp(page, "tabs");
  await page.goto("/create");
  await expect(page).toHaveURL(/\/create/, { timeout: 30_000 });
  const create = page.getByTestId("tab-create");
  await expect(create).toBeVisible();
  await expect(create).toHaveAttribute("aria-current", "page");

  await chooseOccasion(page, "birthday");
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

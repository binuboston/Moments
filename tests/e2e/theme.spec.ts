import { expect, test } from "@playwright/test";

const isDark = (page: import("@playwright/test").Page) => page.evaluate(() => document.documentElement.classList.contains("dark"));

test("follows the system theme by default", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/");
  expect(await isDark(page)).toBe(true);
  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => isDark(page)).toBe(false);
  await context.close();
});

test("a chosen theme sticks across pages and reloads, with no flash", async ({ page, isMobile }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByTestId("theme-dark").click();
    await page.keyboard.press("Escape");
  } else {
    await page.getByTestId("support-menu").click();
    await page.getByTestId("menu-theme-dark").click();
    await page.keyboard.press("Escape");
  }
  expect(await isDark(page)).toBe(true);

  // Applied before first paint: the class is there in the initial HTML response's script, before React runs.
  await page.goto("/templates", { waitUntil: "commit" });
  await page.waitForSelector("html.dark", { state: "attached", timeout: 5000 });
  await page.reload();
  expect(await isDark(page)).toBe(true);

  // Back to the device setting.
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/settings/, { timeout: 30_000 });
  await page.getByTestId("theme-system").first().click();
  expect(await isDark(page)).toBe(false);
});

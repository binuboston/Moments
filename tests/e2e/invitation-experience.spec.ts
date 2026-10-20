import { expect, test } from "@playwright/test";

const DEMO = "/demo/eternal-grace";
const hiddenCount = (page: import("@playwright/test").Page) =>
  page.evaluate(() => [...document.querySelectorAll("[data-inv-reveal],[data-inv-hero]")].filter((e) => getComputedStyle(e).opacity === "0").length);

test.describe("invitation experience", () => {
  test("the envelope opens from the keyboard and reveals the invitation", async ({ page }) => {
    await page.goto(DEMO);
    const cover = page.getByRole("dialog");
    await expect(cover).toBeVisible();
    await expect(page.getByRole("button", { name: /tap to open/i })).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-inv-cover]")).toHaveCount(0, { timeout: 6000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("scrolling reveals every section and shows the quick-action dock", async ({ page }) => {
    await page.goto(DEMO);
    await page.getByRole("button", { name: /tap to open/i }).click();
    await expect(page.locator("[data-inv-cover]")).toHaveCount(0, { timeout: 6000 });
    const height = () => page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < (await height()); y += 600) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(1500);
    expect(await hiddenCount(page)).toBe(0);
    const dock = page.getByRole("navigation", { name: /quick actions/i });
    await expect(dock).toBeVisible();
    await expect(dock.getByRole("link", { name: /directions/i })).toHaveAttribute("href", /^https:\/\//);
    await expect(dock.getByRole("link", { name: /calendar/i })).toHaveAttribute("href", /calendar\.google\.com/);
    await expect(page.getByText("#AishaWedsRohan")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  });

  test("deep links skip the envelope", async ({ page }) => {
    await page.goto(`${DEMO}#rsvp`);
    await expect(page.locator("[data-inv-cover]")).toHaveCount(0);
    await expect(page.locator("#rsvp")).toBeInViewport();
  });

  test("reduced motion shows content without animation", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(DEMO);
    await page.getByRole("button", { name: /tap to open/i }).click();
    await expect(page.locator("[data-inv-cover]")).toHaveCount(0, { timeout: 3000 });
    expect(await hiddenCount(page)).toBe(0);
    await context.close();
  });
});

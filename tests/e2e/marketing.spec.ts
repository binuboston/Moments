import { expect, test } from "@playwright/test";

test.describe("marketing site", () => {
  test("landing page renders hero, live preview and key sections", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Invitations,");
    await expect(page.getByRole("link", { name: /create an invitation/i }).first()).toBeVisible();
    await expect(page.locator('[data-preview-label="Live invitation preview"]')).toBeVisible();
    for (const id of ["designs", "occasions", "how", "features", "pricing", "faq"]) await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(page.getByRole("heading", { name: /questions, answered/i })).toBeVisible();
  });

  test("scroll-driven content becomes visible and nothing stays hidden", async ({ page }) => {
    await page.goto("/about");
    // Re-measure each step: pinned sections add spacer height after ScrollTrigger refreshes.
    const height = () => page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < (await height()); y += 600) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(120);
    }
    await page.waitForTimeout(1500);
    const hidden = await page.evaluate(() => [...document.querySelectorAll("[data-reveal],[data-hero]")].filter((e) => getComputedStyle(e).visibility === "hidden").length);
    expect(hidden).toBe(0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("template catalogue filters and detail page work", async ({ page }) => {
    await page.goto("/templates?category=wedding");
    await expect(page.getByRole("heading", { name: /find the design/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Eternal Grace", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Eternal Grace", exact: true }).click();
    await expect(page).toHaveURL(/\/templates\/eternal-grace/);
    await expect(page.getByRole("heading", { level: 1, name: "Eternal Grace" })).toBeVisible();
    // No account needed: signed-out visitors go straight to guest setup, which continues to the wizard.
    const cta = await page.getByRole("link", { name: /use this template/i }).getAttribute("href");
    expect(decodeURIComponent(cta ?? "")).toMatch(/\/invitations\/new\?template=eternal-grace/);
  });

  test("pricing, how it works and help pages respond", async ({ page }) => {
    for (const path of ["/pricing", "/how-it-works", "/help"]) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("unknown and malformed invitation slugs return 404", async ({ page }) => {
    const unknown = await page.goto("/e/this-slug-does-not-exist-9z9z");
    expect(unknown?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /isn't available/i })).toBeVisible();
    const malformed = await page.goto("/e/Not_A_Valid_Slug!");
    expect(malformed?.status()).toBe(404);
  });

  test("robots blocks private areas and sitemap lists templates", async ({ request }) => {
    const robots = await request.get("/robots.txt");
    const body = await robots.text();
    expect(body).toContain("Disallow: /invitations");
    expect(body).not.toMatch(/Disallow: \/\s*$/m);
    expect(body).toContain("Disallow: /e/");
    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain("/templates/eternal-grace");
  });
});

test("a template card previews the live demo for the chosen occasion", async ({ page, isMobile }) => {
  await page.goto("/templates?category=wedding");
  const card = page.getByRole("article").filter({ has: page.getByRole("link", { name: "Kalyanam", exact: true }) });
  if (!isMobile) await card.hover();
  const preview = card.getByRole("link", { name: "Preview Kalyanam" });
  await expect(preview).toBeVisible();
  await preview.click();
  await expect(page).toHaveURL(/\/demo\/kalyanam\?occasion=wedding$/);
  await expect(page.getByRole("button", { name: "Open", exact: true })).toBeVisible();
});

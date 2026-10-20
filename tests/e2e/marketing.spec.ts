import { expect, test } from "@playwright/test";

test.describe("marketing site", () => {
  test("landing page renders hero, live preview and key sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Choose a design.");
    await expect(page.getByRole("link", { name: /create an invitation/i }).first()).toBeVisible();
    await expect(page.locator('[data-preview-label="Live invitation preview"]')).toBeVisible();
    await expect(page.getByRole("heading", { name: /designs that feel like the occasion/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /questions, answered/i })).toBeVisible();
  });

  test("template catalogue filters and detail page work", async ({ page }) => {
    await page.goto("/templates?category=wedding");
    await expect(page.getByRole("heading", { name: /find the design/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /eternal grace/i })).toBeVisible();
    await page.getByRole("link", { name: /eternal grace/i }).click();
    await expect(page).toHaveURL(/\/templates\/eternal-grace/);
    await expect(page.getByRole("heading", { level: 1, name: "Eternal Grace" })).toBeVisible();
    await expect(page.getByRole("link", { name: /use this template/i })).toHaveAttribute("href", /signup\?next=/);
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
    expect(body).toContain("Disallow: /dashboard");
    expect(body).toContain("Disallow: /e/");
    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain("/templates/eternal-grace");
  });
});

import { expect, test } from "@playwright/test";
import { TEMPLATE_REGISTRY } from "@/features/templates/registry";

/**
 * Visual regression for every template's live demo, as a guest sees it after
 * opening (reduced motion, so the page is static). Opt-in, for refactors:
 *
 *   pnpm test:visual --update-snapshots   # before: record baselines
 *   pnpm test:visual                      # after: compare
 *
 * Baselines are machine-specific (fonts, rendering), so they are not committed.
 */
test.use({ reducedMotion: "reduce" });

for (const def of Object.values(TEMPLATE_REGISTRY)) {
  for (const occasion of def.categories.slice(0, 2)) {
    test(`${def.key} · ${occasion}`, async ({ page }) => {
      await page.goto(`/demo/${def.key}?occasion=${occasion}`);
      const open = page.getByRole("button", { name: "Open", exact: true });
      if (await open.isVisible()) await open.click();
      await expect(page.locator("[data-inv-cover]")).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      // Load every lazy image, then return to the top.
      for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += 700) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(60);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveScreenshot(`${def.key}-${occasion}.png`, {
        fullPage: true,
        // The countdown ticks every second; fixed overlays depend on scroll position.
        mask: [page.getByRole("timer"), page.locator("[data-inv-music], [data-inv-dock], [data-inv-progress]")],
        maxDiffPixelRatio: 0.01,
        timeout: 20_000,
      });
    });
  }
}

import { expect, test } from "@playwright/test";
import { createInvitation, waitForDraft } from "./helpers";

const DEMO = "/demo/eternal-grace";
const hiddenCount = (page: import("@playwright/test").Page) =>
  page.evaluate(() => [...document.querySelectorAll("[data-inv-reveal],[data-inv-hero]")].filter((e) => getComputedStyle(e).opacity === "0").length);

test.describe("invitation experience", () => {
  test("the opening card opens from the keyboard and reveals the invitation", async ({ page }) => {
    await page.goto(DEMO);
    const cover = page.getByRole("dialog");
    await expect(cover).toBeVisible();
    await expect(page.getByRole("button", { name: "Open", exact: true })).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-inv-cover]")).toHaveCount(0, { timeout: 6000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("scrolling reveals every section and shows the quick-action dock", async ({ page }) => {
    await page.goto(DEMO);
    await page.getByRole("button", { name: "Open", exact: true }).click();
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

  test("a guest link greets the guest by name", async ({ page }) => {
    await page.goto(`${DEMO}?guest=Priya%20Sharma`);
    const cover = page.getByRole("dialog");
    await expect(cover.getByText("Priya Sharma")).toBeVisible();
    await expect(cover.getByText(/cordially invites/i)).toBeVisible();
  });

  test("deep links skip the opening card", async ({ page }) => {
    await page.goto(`${DEMO}#rsvp`);
    await expect(page.locator("[data-inv-cover]")).toHaveCount(0);
    await expect(page.locator("#rsvp")).toBeInViewport();
  });

  test("reduced motion shows content without animation", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(DEMO);
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await expect(page.locator("[data-inv-cover]")).toHaveCount(0, { timeout: 3000 });
    expect(await hiddenCount(page)).toBe(0);
    await context.close();
  });
});

test.describe("background music", () => {
  test("starts when the guest opens the invitation and can be muted", async ({ page }) => {
    await page.goto(DEMO);
    const music = page.getByRole("button", { name: "Background music" });
    await expect(music).toHaveCount(0);
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await expect(music).toBeVisible({ timeout: 6000 });
    await expect(music).toHaveAttribute("aria-pressed", "true", { timeout: 10_000 });
    await music.click();
    await expect(music).toHaveAttribute("aria-pressed", "false");
    await music.click();
    await expect(music).toHaveAttribute("aria-pressed", "true");
  });

  test("the owner picks a track in the editor", async ({ page }) => {
    const id = await createInvitation(page, "wedding", "eternal-grace");
    await page.getByTestId("editor-section-music").click();
    const preview = page.getByTestId("music-preview-clair-de-lune");
    await preview.click();
    await expect(preview).toHaveAttribute("aria-pressed", "true");
    await preview.click();
    await expect(preview).toHaveAttribute("aria-pressed", "false");
    await page.locator("label", { hasText: "Clair de Lune" }).click();
    await expect(page.getByRole("radio", { name: /Clair de Lune/ })).toBeChecked();
    await waitForDraft(page, id, (d) => (d.settings as { musicTrack?: string }).musicTrack, "clair-de-lune");
    await expect(page.getByTestId("editor-section-music")).toContainText("Clair de Lune");
    await page.locator("label", { hasText: "No music" }).click();
    await waitForDraft(page, id, (d) => (d.settings as { musicTrack?: string }).musicTrack, "");
  });
});

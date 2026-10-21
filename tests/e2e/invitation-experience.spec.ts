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

test.describe("gallery carousel", () => {
  const open = async (page: import("@playwright/test").Page) => {
    await page.goto(DEMO);
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await expect(page.locator("[data-inv-cover]")).toHaveCount(0, { timeout: 6000 });
    const carousel = page.getByRole("region", { name: "Photo gallery" });
    await carousel.scrollIntoViewIfNeeded();
    await expect(carousel).toBeVisible();
    return carousel;
  };
  const counter = (carousel: import("@playwright/test").Locator) => carousel.locator("[aria-live]");

  test("moves with buttons, keys and taps, and opens the full-screen viewer", async ({ page }) => {
    const carousel = await open(page);
    await expect(counter(carousel)).toContainText("01");
    await carousel.getByRole("button", { name: "Next photo" }).click();
    await expect(counter(carousel)).toContainText("02");

    await page.getByRole("region", { name: "Photo gallery" }).getByLabel(/Use the arrow keys/).focus();
    await page.keyboard.press("ArrowRight");
    await expect(counter(carousel)).toContainText("03");
    await page.keyboard.press("Home");
    await expect(counter(carousel)).toContainText("01");
    // Let the carousel settle before tapping: mid-move, the tapped photo may already be in front.
    await expect(carousel.getByLabel(/Use the arrow keys/)).not.toHaveAttribute("data-moving", /.*/);

    // A side photo comes to the front first; the front photo opens.
    await carousel.getByRole("button", { name: /Bring to the front/ }).first().click();
    await expect(counter(carousel)).toContainText("02");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await carousel.getByRole("button", { name: /Open full screen/ }).click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer).toContainText("Photo 2 of 5");
    await page.keyboard.press("ArrowRight");
    await expect(viewer).toContainText("Photo 3 of 5");
    await page.keyboard.press("Escape");
    await expect(viewer).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  });

  test("a mouse drag throws to the next photos", async ({ page, isMobile }) => {
    test.skip(isMobile, "Touch scrolling is native on phones");
    const carousel = await open(page);
    const track = carousel.getByLabel(/Use the arrow keys/);
    const box = (await track.boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.75, y);
    await page.mouse.down();
    for (let i = 1; i <= 8; i++) await page.mouse.move(box.x + box.width * 0.75 - i * 40, y);
    await page.mouse.up();
    await expect(counter(carousel)).not.toContainText("01 /", { timeout: 3000 });
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("the owner can switch the gallery to a grid", async ({ page }) => {
    const id = await createInvitation(page, "wedding", "eternal-grace");
    await page.getByTestId("editor-section-design").click();
    await page.getByTestId("gallery-grid").click();
    await expect(page.getByTestId("gallery-grid")).toHaveAttribute("aria-checked", "true");
    await waitForDraft(page, id, (d) => (d.theme as { gallery?: string }).gallery, "grid");
  });
});

test("scroll-linked effects run on the guest page", async ({ page, isMobile }) => {
  test.skip(isMobile, "Covered on desktop; the same code runs on phones");
  await page.goto(DEMO);
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await expect(page.locator("[data-inv-cover]")).toHaveCount(0, { timeout: 6000 });
  // Word-by-word passages are split into words; the progress bar fills as the guest scrolls.
  await expect(page.locator("[data-inv-reveal='words'] .inv-word").first()).toBeAttached();
  const progress = () => page.locator("[data-inv-progress]").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a);
  await page.mouse.wheel(0, 2500);
  await expect.poll(progress, { timeout: 4000 }).toBeGreaterThan(0.1);
});

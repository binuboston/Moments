import { expect, test } from "@playwright/test";
import { createInvitation, signUp, waitForDraft } from "./helpers";

test.describe("cinematic live demo", () => {
  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  test("opens by keyboard and every control does something real", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

    await page.goto("/demo/shubh-vivah");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId("open-invitation")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog).toBeHidden({ timeout: 10_000 });

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ananya");
    await expect(page.getByText("ॐ श्री गणेशाय नमः").first()).toBeVisible();

    const google = page.getByTestId("add-google-calendar");
    await expect(google).toHaveAttribute("href", /calendar\.google\.com\/calendar\/render\?action=TEMPLATE/);
    const download = page.waitForEvent("download");
    await page.getByTestId("download-ics").click();
    const ics = await download;
    expect(ics.suggestedFilename()).toMatch(/\.ics$/);

    await expect(page.getByTestId("directions")).toHaveAttribute("href", /google\.com\/maps\/search\/\?api=1&query=Bolgatty%20Palace/);
    await expect(page.getByRole("img", { name: /QR code for directions/i })).toBeVisible();

    await page.getByTestId("copy-hashtag").click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("#AnanyaWedsKiran");

    // Lightbox opens from the gallery and closes with Escape.
    await page.getByRole("button", { name: /open photo 1/i }).click();
    await expect(page.getByRole("dialog", { name: "Photo gallery" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Photo gallery" })).toBeHidden();

    // Map loads only on request.
    await page.getByTestId("load-map").click();
    await expect(page.locator("iframe[title^='Map of']")).toHaveAttribute("src", /google\.com\/maps\?q=/);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });

  test("works at 320px wide and under reduced motion", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 640 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    for (const slug of ["shubh-vivah", "royal-night", "gulmohar-garden"]) {
      await page.goto(`${baseURL}/demo/${slug}`);
      await page.getByTestId("open-invitation").click();
      await expect(page.getByRole("dialog")).toBeHidden({ timeout: 5_000 });
      // With reduced motion nothing waits on scroll: closing content is already visible.
      await page.getByRole("heading", { name: /Ananya|Meera/, level: 2 }).last().scrollIntoViewIfNeeded();
      await expect(page.getByTestId("share-invitation")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, slug).toBeLessThanOrEqual(1);
    }
    await ctx.close();
  });

  test("template page links to the live demo", async ({ page }) => {
    await page.goto("/templates/royal-night");
    await expect(page.getByTestId("live-demo")).toHaveAttribute("href", "/demo/royal-night");
  });
});

test.describe("cinematic invitation for a real owner", () => {
  test.describe.configure({ mode: "serial" });

  test("publish a Gulmohar Garden invitation, open it, and see an honest past-date state", async ({ page, browser, baseURL }) => {
    await signUp(page, "cinematic");
    const id = await createInvitation(page, "engagement", "gulmohar-garden");

    // Fill the minimum through the editor, including traditional touches.
    await page.getByLabel("Partner one", { exact: true }).fill("Neelanjana");
    await page.getByLabel("Partner two", { exact: true }).fill("Anurag");
    await page.getByTestId("field-headline").fill("We said yes");
    await page.getByLabel("Invocation or blessing").fill("ॐ श्री गणेशाय नमः");
    await page.getByLabel("Title in your language").fill("ശുഭ വിവാഹം");
    await page.getByLabel("Wedding hashtag").fill("#NeelanjanaWedsAnurag");
    await page.getByTestId("field-venue-name").fill("CR Auditorium");
    await waitForDraft(page, id, (d) => (d.content as { hashtag: string }).hashtag.replace(/^#/, ""), "NeelanjanaWedsAnurag");

    // The editor preview shows the cover and can replay it.
    if ((page.viewportSize()?.width ?? 1280) < 1024) await page.getByRole("button", { name: "Preview", exact: true }).click();
    await expect(page.getByTestId("replay-opening").filter({ visible: true })).toBeVisible();
    await page.getByTestId("replay-opening").filter({ visible: true }).click();
    await expect(page.getByTestId("open-invitation").filter({ visible: true })).toBeVisible();
    await page.keyboard.press("Escape");

    // Set the reference date (already past) through the API, as the owner.
    const current = (await (await page.request.get(`/api/invitations/${id}`)).json()) as { content: Record<string, unknown> };
    const patch = await page.request.patch(`/api/invitations/${id}`, {
      data: { content: { ...current.content, startsAt: "2026-10-19T11:40:00+05:30", timezone: "Asia/Kolkata" } },
    });
    expect(patch.ok()).toBe(true);
    const publish = await page.request.post(`/api/invitations/${id}/publish`);
    expect(publish.ok()).toBe(true);
    const { slug } = (await publish.json()) as { slug: string };

    const guest = await browser.newContext();
    const gp = await guest.newPage();
    const res = await gp.goto(`${baseURL}/e/${slug}`);
    expect(res?.status()).toBe(200);
    await expect(gp.getByRole("dialog")).toBeVisible();
    await gp.getByTestId("open-invitation").click();
    await expect(gp.getByRole("dialog")).toBeHidden({ timeout: 10_000 });
    await expect(gp.getByRole("heading", { level: 1 })).toContainText("Neelanjana");
    await gp.getByTestId("countdown-done").scrollIntoViewIfNeeded();
    await expect(gp.getByTestId("countdown-done")).toContainText("Thank you for celebrating with us");
    await expect(gp.getByTestId("copy-hashtag")).toContainText("#NeelanjanaWedsAnurag");

    // The same guest does not have to open the envelope again in this tab.
    await gp.reload();
    await expect(gp.getByRole("dialog")).toBeHidden({ timeout: 5_000 });
    await guest.close();
  });
});

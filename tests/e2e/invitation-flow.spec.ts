import { expect, test } from "@playwright/test";
import { createInvitation, logIn, openStep, signUp, waitForDraft } from "./helpers";

/**
 * Full product journey. Tests run serially in one worker and share module
 * state (owner credentials, invitation id, public slug). Each test gets a fresh
 * browser context, so the owner logs in again where needed.
 */
test.describe.configure({ mode: "serial" });

let ownerEmail: string;
let invitationId: string;
let publicUrl: string;
let slug: string;
const headline = `Maya turns five ${Date.now().toString(36)}`;

test("owner creates a draft through the wizard and edits it", async ({ page }) => {
  ownerEmail = (await signUp(page, "owner")).email;
  invitationId = await createInvitation(page, "birthday", "confetti-pop");

  // A new invitation opens on its first step; Next walks through the rest.
  await expect(page.getByTestId("editor-step-names")).toBeVisible();
  await page.getByLabel("Who's celebrating?").fill("Maya");
  await page.getByTestId("step-next").click();
  await expect(page.getByTestId("editor-step-when")).toBeVisible();
  await page.getByTestId("step-next").click();
  await page.getByTestId("field-venue-name").fill("The Orangery");
  await openStep(page, "words");
  await page.getByTestId("field-headline").fill(headline);
  await waitForDraft(page, invitationId, (d) => (d.content as { headline: string }).headline, headline);

  // Draft persistence: a hard reload shows the saved values.
  await page.reload();
  await expect(page.getByLabel("Who's celebrating?")).toHaveValue("Maya");
  await openStep(page, "words");
  await expect(page.getByTestId("field-headline")).toHaveValue(headline);
  await expect(page.getByTestId("save-indicator")).toContainText(/saved/i);

  // The editor must never overflow horizontally (this broke mobile clicks once).
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("owner personalises the design and enables RSVP", async ({ page }) => {
  await logIn(page, ownerEmail);
  await page.goto(`/invitations/${invitationId}/edit`);

  // One step at a time; jump straight to "Look & feel" from the step bar.
  await openStep(page, "design");
  await page.getByTestId("palette-ocean").click();
  await waitForDraft(page, invitationId, (d) => (d.theme as { paletteId: string }).paletteId, "ocean");

  // Edit / Preview tabs replace the side-by-side preview.
  await page.getByTestId("view-preview").click();
  await expect(page.getByTestId("preview")).toBeVisible();
  await page.getByTestId("view-edit").click();
  await expect(page.getByTestId("editor-step-design")).toBeVisible();

  // The design switcher lists the designs for this occasion.
  await page.getByTestId("template-switcher").click();
  await expect(page.getByTestId("switch-template-confetti-pop")).toBeVisible();
  await page.keyboard.press("Escape");

  // Settings open as a sheet from the toolbar gear.
  await page.getByTestId("open-settings").click();
  await page.getByTestId("rsvp-toggle").click();
  await waitForDraft(page, invitationId, (d) => (d.settings as { rsvp: { enabled: boolean } }).rsvp.enabled, true);
});

test("owner publishes and gets a WhatsApp-ready link", async ({ page }) => {
  await logIn(page, ownerEmail);
  await page.goto(`/invitations/${invitationId}/edit`);
  await page.getByTestId("go-to-publish").click();
  await expect(page.getByTestId("publish")).toBeEnabled();
  await page.getByTestId("publish").click();

  const urlInput = page.getByTestId("public-url");
  await expect(urlInput).toBeVisible({ timeout: 20_000 });
  publicUrl = await urlInput.inputValue();
  expect(publicUrl).toMatch(/\/e\/[a-z0-9-]+$/);
  slug = publicUrl.split("/e/")[1];

  // First publish opens the share dialog automatically with a celebration header.
  await expect(page.getByRole("dialog").getByText("You're live")).toBeVisible();
  const href = await page.getByTestId("share-whatsapp").getAttribute("href");
  expect(href).toContain("https://wa.me/?text=");
  expect(decodeURIComponent(href!)).toContain(publicUrl);
  expect(decodeURIComponent(href!)).toContain(headline);
});

test("guests open the invitation and RSVP without an account", async ({ browser, baseURL }) => {
  const guest = await browser.newContext();
  const page = await guest.newPage();
  const res = await page.goto(`${baseURL}/e/${slug}`);
  expect(res?.status()).toBe(200);
  // Guests tap Open on the welcome card first.
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await expect(page.locator("[data-inv-cover]")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(headline);

  const escaped = headline.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", new RegExp(escaped));
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  const og = await page.request.get(`${baseURL}/e/${slug}/opengraph-image`);
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");

  // No horizontal overflow on this viewport (desktop and mobile projects).
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  await page.getByLabel("Your name").fill("Priya Sharma");
  await page.getByRole("button", { name: /send response/i }).click();
  await expect(page.getByText(/thank you/i)).toBeVisible({ timeout: 15_000 });

  // Guest data is never exposed publicly.
  const api = await page.request.get(`${baseURL}/api/invitations/${invitationId}/rsvps`);
  expect(api.status()).toBe(401);
  await guest.close();
});

test("owner sees the response and can export it", async ({ page }) => {
  await logIn(page, ownerEmail);
  await page.goto(`/invitations/${invitationId}/rsvps`);
  // Table from md up, one card per guest on phones; either way the name must be visible.
  await expect(page.getByText("Priya Sharma", { exact: true }).filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 });
  const csv = await page.request.get(`/api/invitations/${invitationId}/rsvps?format=csv`);
  expect(csv.ok()).toBe(true);
  expect(await csv.text()).toContain("Priya Sharma");
});

test("another user cannot open or change the owner's invitation", async ({ page, baseURL }) => {
  await signUp(page, "intruder");
  await page.goto(`${baseURL}/invitations/${invitationId}/edit`);
  await expect(page.getByText(/invitation not found/i)).toBeVisible();
  await expect(page.getByTestId("field-headline")).toHaveCount(0);

  expect((await page.request.get(`/api/invitations/${invitationId}`)).status()).toBe(404);
  expect((await page.request.patch(`/api/invitations/${invitationId}`, { data: { title: "hacked" } })).status()).toBe(404);
  expect((await page.request.get(`/api/invitations/${invitationId}/rsvps`)).status()).toBe(404);
  expect((await page.request.post(`/api/invitations/${invitationId}/unpublish`)).status()).toBe(404);
});

test("duplicate slugs are rejected and unpublishing takes the page offline", async ({ page, browser, baseURL }) => {
  await logIn(page, ownerEmail);
  const availability = await page.request.get(`/api/slug-availability?slug=${slug}`);
  expect((await availability.json()).available).toBe(false);

  await page.goto(`/invitations/${invitationId}/edit`);
  await page.getByTestId("go-to-publish").click();
  await page.getByTestId("unpublish").click();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Unpublished", { exact: true }).filter({ visible: true }).first()).toBeVisible({ timeout: 15_000 });

  const guest = await browser.newContext();
  const guestPage = await guest.newPage();
  const res = await guestPage.goto(`${baseURL}/e/${slug}`);
  expect(res?.status()).toBe(404);
  await expect(guestPage.getByRole("heading", { name: /isn't available/i })).toBeVisible();
  await guest.close();
});

test("owner can delete the invitation from the dashboard", async ({ page }) => {
  await logIn(page, ownerEmail);
  await page.goto("/invitations");
  await page.getByRole("button", { name: /more actions/i }).first().click();
  await page.getByRole("menuitem", { name: /delete/i }).click();
  await page.getByRole("button", { name: /delete permanently/i }).click();
  await expect(page.getByText(/no invitations yet/i)).toBeVisible({ timeout: 15_000 });
  // The UI removes the card optimistically; wait for the server to confirm the deletion.
  await expect.poll(async () => (await page.request.get(`/api/invitations/${invitationId}`)).status(), { timeout: 15_000 }).toBe(404);
});

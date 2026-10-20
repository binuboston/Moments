import { expect, test } from "@playwright/test";
import { PASSWORD, uniqueEmail, waitForDraft } from "./helpers";

test.describe.configure({ mode: "serial" });

test("starting from the site navigation (client-side) lands in the wizard as a guest", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByTestId("mobile-account-start").click();
  } else {
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Create" }).click();
  }
  await expect(page).toHaveURL(/\/invitations\/new$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /create an invitation/i })).toBeVisible();
  // In the wizard the phone tab bar steps aside; the account is in the top bar on every size.
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByRole("menu").getByText("Guest", { exact: true })).toBeVisible();
});

test("a visitor designs without an account and signs up only to publish", async ({ page }) => {
  // Starting from a template CTA: no login wall, a guest session is created on the way.
  await page.goto("/invitations/new");
  await expect(page).toHaveURL(/\/invitations\/new/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /create an invitation/i })).toBeVisible();

  await page.getByTestId("category-birthday").click();
  await page.getByTestId("template-confetti-pop").click();
  await page.getByTestId("create-invitation").click();
  await page.waitForURL(/\/invitations\/[0-9a-f-]{36}\/edit/, { timeout: 30_000 });
  const id = page.url().match(/invitations\/([0-9a-f-]{36})\/edit/)![1];

  await page.getByLabel("Who's celebrating?").fill("Maya");
  await page.getByTestId("field-headline").fill("Maya turns five");
  await waitForDraft(page, id, (d) => (d.content as { headline: string }).headline, "Maya turns five");

  // Guests cannot publish through the API either.
  const blocked = await page.request.post(`/api/invitations/${id}/publish`);
  expect(blocked.status()).toBe(403);

  // Publishing asks for an account right in the sheet.
  await page.getByTestId("go-to-publish").click();
  const gate = page.getByTestId("account-gate");
  await expect(gate).toBeVisible();
  await expect(page.getByTestId("publish")).toHaveCount(0);

  await gate.getByLabel("Full name").fill("Maya's Mum");
  await gate.getByLabel("Email").fill(uniqueEmail("guest"));
  await gate.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await gate.getByRole("button", { name: "Create account" }).click();

  // The same draft, now owned by the account; the publish sheet reopens.
  await expect(page.getByTestId("publish")).toBeEnabled({ timeout: 30_000 });
  await expect(page).toHaveURL(new RegExp(`/invitations/${id}/edit`));
  await page.getByTestId("publish").click();
  await expect(page.getByTestId("public-url")).toBeVisible({ timeout: 20_000 });
});

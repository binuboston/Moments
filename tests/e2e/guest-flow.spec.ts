import { expect, test } from "@playwright/test";
import { PASSWORD, uniqueEmail, waitForDraft } from "./helpers";

test.describe.configure({ mode: "serial" });

test("a visitor designs without an account and signs up only to publish", async ({ page }) => {
  // Starting from a template CTA: no login wall, a guest session is created on the way.
  await page.goto("/dashboard/invitations/new");
  await expect(page).toHaveURL(/\/dashboard\/invitations\/new/, { timeout: 30_000 });
  await expect(page.getByTestId("guest-banner")).toBeVisible();

  await page.getByTestId("category-birthday").click();
  await page.getByTestId("template-confetti-pop").click();
  await page.getByTestId("create-invitation").click();
  await page.waitForURL(/\/dashboard\/invitations\/[0-9a-f-]{36}\/edit/, { timeout: 30_000 });
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
  await expect(page).toHaveURL(new RegExp(`/dashboard/invitations/${id}/edit`));
  await expect(page.getByTestId("guest-banner")).toHaveCount(0);
  await page.getByTestId("publish").click();
  await expect(page.getByTestId("public-url")).toBeVisible({ timeout: 20_000 });
});
